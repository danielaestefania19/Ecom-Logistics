-- Leads: website contact-form submissions worked by staff until won (→ client account) or lost.
-- Public intake goes through the lead-intake edge function (service role), never direct inserts.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  number integer generated always as identity (start with 101) unique,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'quoted', 'won', 'lost')),
  first_name text,
  last_name text,
  company text,
  website text,
  email text,
  phone text,
  services text[] not null default '{}' check (services <@ array['prep', '3pl', 'ltl']),
  units_per_month integer check (units_per_month >= 0),
  shipments_per_month integer check (shipments_per_month >= 0),
  message text,
  language text check (language in ('en', 'es')),
  state text,
  city text,
  heard_from text,
  source text not null default 'website' check (source in ('website', 'manual', 'asana_import')),
  owner_id uuid references auth.users (id),
  next_follow_up_at timestamptz,
  last_contacted_at timestamptz,
  lost_reason text,
  converted_client_id uuid references public.clients (id),
  asana_task_gid text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create index leads_status_idx on public.leads (status, created_at desc);
create index leads_email_idx on public.leads (lower(email));

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.update_updated_at();

-- One timeline per lead. actor_id is null for system/automation entries (website intake, future AI outreach).
create table public.lead_activities (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads (id) on delete cascade,
  kind text not null
    check (kind in ('note', 'call', 'email', 'whatsapp', 'meeting', 'status_change', 'system')),
  body text,
  from_status text,
  to_status text,
  actor_id uuid default auth.uid() references auth.users (id),
  created_at timestamptz not null default now()
);

create index lead_activities_idx on public.lead_activities (lead_id, created_at);

create or replace function public.leads_log_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into lead_activities (lead_id, kind, to_status, body, actor_id)
    values (new.id, 'system', new.status, 'lead_created_' || new.source, auth.uid());
  elsif new.status is distinct from old.status then
    insert into lead_activities (lead_id, kind, from_status, to_status, body, actor_id)
    values (new.id, 'status_change', old.status, new.status,
            case when new.status = 'lost' then new.lost_reason end, auth.uid());
  end if;
  return new;
end;
$$;

create trigger leads_log_status
  after insert or update of status on public.leads
  for each row execute function public.leads_log_status();

-- Logging a real contact on a lead stamps last_contacted_at and moves a brand-new lead to contacted.
create or replace function public.lead_activity_touch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.kind in ('call', 'email', 'whatsapp', 'meeting') then
    update leads
    set last_contacted_at = new.created_at,
        status = case when status = 'new' then 'contacted' else status end
    where id = new.lead_id;
  end if;
  return new;
end;
$$;

create trigger lead_activity_touch
  after insert on public.lead_activities
  for each row execute function public.lead_activity_touch();

alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;

create policy "Staff read" on public.leads for select to authenticated using (public.is_staff());
create policy "Staff insert" on public.leads for insert to authenticated with check (public.is_staff());
create policy "Staff update" on public.leads for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff read" on public.lead_activities for select to authenticated using (public.is_staff());
-- Status changes are logged by the trigger; people add notes and contact attempts only.
create policy "Staff add" on public.lead_activities for insert to authenticated
  with check (public.is_staff() and kind not in ('status_change', 'system'));

revoke execute on function public.leads_log_status() from public, anon, authenticated;
revoke execute on function public.lead_activity_touch() from public, anon, authenticated;

alter publication supabase_realtime add table public.leads;

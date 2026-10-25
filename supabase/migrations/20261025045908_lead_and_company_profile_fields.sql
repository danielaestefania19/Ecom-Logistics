-- Extra qualification data from the website form, and the company profile clients complete in the portal.

alter table public.leads
  add column sales_channels text[] not null default '{}'
    check (sales_channels <@ array['amazon', 'shopify', 'tiktok', 'walmart', 'other']),
  add column seller_id_or_store text,
  add column product_category text,
  add column hazmat boolean not null default false,
  add column fragile boolean not null default false,
  add column job_title text,
  add column whatsapp text,
  add column preferred_contact text check (preferred_contact in ('email', 'phone', 'whatsapp'));

alter table public.clients
  add column legal_name text,
  add column website text,
  add column address_line1 text,
  add column address_line2 text,
  add column address_city text,
  add column address_state text,
  add column address_zip text,
  add column address_country text not null default 'US',
  add column sales_channels text[] not null default '{}'
    check (sales_channels <@ array['amazon', 'shopify', 'tiktok', 'walmart', 'other']),
  add column seller_id_or_store text,
  add column product_category text,
  add column job_title text,
  add column whatsapp text,
  add column preferred_contact text check (preferred_contact in ('email', 'phone', 'whatsapp')),
  add column profile_completed_at timestamptz;

-- Clients may not update their own row (it holds role/services/Stripe ids), so profile edits go through
-- this function, which only touches descriptive columns of the caller's own row.
create or replace function public.update_my_profile(p jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if nullif(trim(p->>'legal_name'), '') is null
     or nullif(trim(p->>'address_line1'), '') is null
     or nullif(trim(p->>'address_city'), '') is null
     or nullif(trim(p->>'address_state'), '') is null
     or nullif(trim(p->>'address_zip'), '') is null then
    raise exception 'company name and full address are required';
  end if;

  update clients set
    full_name = coalesce(nullif(trim(p->>'full_name'), ''), full_name),
    company = coalesce(nullif(trim(p->>'company'), ''), company),
    phone = nullif(trim(p->>'phone'), ''),
    language = coalesce(nullif(p->>'language', ''), language),
    legal_name = trim(p->>'legal_name'),
    website = nullif(trim(p->>'website'), ''),
    address_line1 = trim(p->>'address_line1'),
    address_line2 = nullif(trim(p->>'address_line2'), ''),
    address_city = trim(p->>'address_city'),
    address_state = trim(p->>'address_state'),
    address_zip = trim(p->>'address_zip'),
    address_country = coalesce(nullif(trim(p->>'address_country'), ''), 'US'),
    sales_channels = coalesce(array(select jsonb_array_elements_text(p->'sales_channels')), '{}'),
    seller_id_or_store = nullif(trim(p->>'seller_id_or_store'), ''),
    product_category = nullif(trim(p->>'product_category'), ''),
    job_title = nullif(trim(p->>'job_title'), ''),
    whatsapp = nullif(trim(p->>'whatsapp'), ''),
    preferred_contact = nullif(p->>'preferred_contact', ''),
    profile_completed_at = coalesce(profile_completed_at, now())
  where id = auth.uid();
  if not found then raise exception 'client profile not found'; end if;
end;
$$;

revoke execute on function public.update_my_profile(jsonb) from public, anon;
grant execute on function public.update_my_profile(jsonb) to authenticated;

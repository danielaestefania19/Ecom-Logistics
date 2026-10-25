import { adminClient } from "./http.ts";

export type Caller = { id: string; role: string };

// For functions with verify_jwt=true the gateway already checked the signature; this resolves the user and role.
export async function getCaller(req: Request): Promise<Caller | null> {
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return null;
  const admin = adminClient();
  const { data: { user }, error } = await admin.auth.getUser(jwt);
  if (error || !user) return null;
  const { data: profile } = await admin.from("clients").select("role").eq("id", user.id).single();
  return { id: user.id, role: profile?.role ?? "client" };
}

export const isStaffRole = (role: string) => role === "staff" || role === "admin";

export const canActForClient = (caller: Caller, clientId: string) =>
  caller.id === clientId || isStaffRole(caller.role);

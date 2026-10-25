import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// Staff-only list of clients enrolled in 3PL; empty for clients (RLS only returns their own row anyway).
export function useThreePlClients(enabled) {
  const [clients, setClients] = useState([]);
  useEffect(() => {
    if (!enabled) return;
    supabase
      .from("clients")
      .select("id, company, full_name, email, storage_bins, storage_shelves, storage_pallets")
      .contains("services", ["3pl"])
      .order("company")
      .then(({ data }) => setClients(data ?? []));
  }, [enabled]);
  return clients;
}

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

const roleOf = (profile) => profile?.role ?? (profile?.is_admin ? "admin" : "client");

export const AuthProvider = ({ children }) => {
  const [session, setSession]             = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [clientProfile, setClientProfile] = useState(null);
  // Which user the current profile belongs to; until it matches, role-gated routes must wait.
  const [profileFor, setProfileFor] = useState(null);

  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on subscribe, so getSession() isn't needed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSessionLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setClientProfile(null);
      setProfileFor(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("clients")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Failed to load client profile:", error.message);
        setClientProfile(data ?? null);
        setProfileFor(userId);
      });
    return () => { cancelled = true; };
  }, [userId]);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const sendPasswordReset = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/portal/set-password`,
    });

  const value = {
    user,
    session,
    clientProfile,
    role: clientProfile ? roleOf(clientProfile) : null,
    loading: sessionLoading || (!!userId && profileFor !== userId),
    signIn,
    signOut,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

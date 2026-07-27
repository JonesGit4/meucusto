"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : "",
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="w-8 h-8 rounded-full bg-[var(--color-bg-card)] animate-pulse" />;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <img
          src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
          alt=""
          className="w-7 h-7 rounded-full"
        />
        <button onClick={handleLogout} className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors">
          Sair
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin}
      className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)]">
      Entrar com Google
    </button>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Sparkles, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }
    }

    // Redirect to dashboard
    router.push("/");
  };

  const handleDemoLogin = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl border-border/80 relative overflow-hidden">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 text-white shadow-lg shadow-primary/25">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Sign in to KnowledgeOS
          </h1>
          <p className="text-xs text-muted-foreground">
            Your personal engineering roadmap and knowledge repository.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Email Address</label>
            <Input
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-foreground">Password</label>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full font-bold shadow-md shadow-primary/20">
            {loading ? "Signing in..." : "Sign In with Supabase"}
          </Button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-2 text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">
              or quick explore
            </span>
            <div className="border-t border-border w-full" />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleDemoLogin}
            className="w-full gap-2 text-xs font-semibold"
          >
            <Sparkles className="h-4 w-4 text-primary" /> Browse Vault in Viewer Mode
          </Button>
        </form>
      </Card>
    </div>
  );
}

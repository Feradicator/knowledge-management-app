"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl border-border/80 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 text-white shadow-lg shadow-primary/25">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Owner Only Access
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Public user registration is disabled for this personal knowledge vault. If you are the owner, please sign in with your credentials.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/auth/login" className="block">
            <Button className="w-full gap-2 font-bold shadow-md shadow-primary/20">
              <KeyRound className="h-4 w-4" /> Go to Owner Sign In
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button variant="outline" className="w-full gap-2 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Knowledge Vault
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

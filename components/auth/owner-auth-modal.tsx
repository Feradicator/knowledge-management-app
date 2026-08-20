"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLearningStore } from "@/lib/store/learning-store";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export function OwnerAuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMessage,
    signIn,
    isOwner,
    currentUser,
    signOut,
  } = useLearningStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await signIn(email, password);
    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      title="Owner Access Control"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Header Hero */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-transparent border border-primary/20">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isOwner ? "Owner Mode Active" : "Owner Sign In"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isOwner
                ? "You have full editing permissions on this knowledge vault."
                : "Sign in with your owner credentials to unlock edit access."}
            </p>
          </div>
        </div>

        {/* Action Prompt Message if triggered by an edit attempt */}
        {authModalMessage && !isOwner && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{authModalMessage}</span>
          </div>
        )}

        {isOwner ? (
          /* Currently Signed In as Owner */
          <div className="space-y-4 py-2 text-center">
            <div className="p-4 rounded-xl bg-card border border-border/80 text-left space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Authenticated Account:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Owner Verified
                </span>
              </div>
              <p className="text-sm font-bold text-foreground">
                {currentUser?.email || "Vault Owner"}
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setIsAuthModalOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await signOut();
                  setIsAuthModalOpen(false);
                }}
                className="text-xs"
              >
                Sign Out to Viewer Mode
              </Button>
            </div>
          </div>
        ) : (
          /* Sign In Form Only */
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Owner Email
                </label>
                <Input
                  type="email"
                  placeholder="owner@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-4 w-4" />}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="text-xs"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> Continue Viewing
                </Button>

                <Button type="submit" disabled={loading} className="gap-1.5 text-xs font-bold shadow-xs">
                  <KeyRound className="h-3.5 w-3.5" />
                  {loading ? "Authenticating..." : "Sign In as Owner"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
}

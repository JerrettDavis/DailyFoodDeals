"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { CheckCircleIcon, LogoMark, ShieldIcon, SparklesIcon } from "@/components/ui/icons";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const rawCallbackUrl = searchParams.get("callbackUrl");
    const callbackUrl = (() => {
      if (!rawCallbackUrl) return "/";

      try {
        const url = new URL(rawCallbackUrl, window.location.origin);
        const currentUrl = new URL(window.location.origin);
        const sameOrigin = url.origin === currentUrl.origin;
        const isLoopbackRedirect =
          ["localhost", "127.0.0.1"].includes(url.hostname) &&
          ["localhost", "127.0.0.1"].includes(currentUrl.hostname) &&
          url.port === currentUrl.port &&
          url.protocol === currentUrl.protocol;

        if (!sameOrigin && !isLoopbackRedirect) {
          return "/";
        }

        const normalizedPath = `${url.pathname}${url.search}${url.hash}`;
        return normalizedPath.startsWith("/") && !normalizedPath.startsWith("//")
          ? normalizedPath
          : "/";
      } catch {
        return "/";
      }
    })();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.status === 503) {
      setError("Sign-in is temporarily unavailable on this deployment.");
    } else if (result?.error) {
      setError("Invalid email or password");
    } else {
      window.location.href = callbackUrl;
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="relative overflow-hidden border-orange-500/15 bg-gradient-to-br from-orange-500/14 via-white/[0.04] to-white/[0.02] p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_30%)]" />
          <div className="relative space-y-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-200">
              <LogoMark size={24} />
            </div>
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-gray-300">
                <SparklesIcon size={14} />
                Members area
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Welcome Back</h1>
                <p className="max-w-xl text-base leading-7 text-gray-300">
                  Sign in to DailyFoodDeals and keep your saved spots, neighborhood finds, and submissions synced across every visit.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <ShieldIcon size={18} className="text-orange-300" />
                <p className="mt-3 font-medium text-white">Save favorites</p>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Keep your go-to lunch deals and family spots one tap away.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <CheckCircleIcon size={18} className="text-orange-300" />
                <p className="mt-3 font-medium text-white">Track submissions</p>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Share new deals and follow them through moderation.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-gray-500">Sign in</p>
              <p className="text-sm leading-6 text-gray-400">
                Use your account to unlock favorites, deal voting, and submissions.
              </p>
            </div>

            {registered ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                Account created! Sign in below.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField htmlFor="signin-email" label="Email" required>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </FormField>

              <FormField htmlFor="signin-password" label="Password" required>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </FormField>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-orange-300 hover:text-white">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

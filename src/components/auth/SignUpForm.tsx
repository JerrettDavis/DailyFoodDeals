"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/actions/deals";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { CheckCircleIcon, LogoMark, SparklesIcon } from "@/components/ui/icons";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await registerUser(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      router.push("/auth/signin?registered=true");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-gray-500">Create account</p>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Create Account</h1>
                <p className="text-sm leading-6 text-gray-400">
                  Join DailyFoodDeals to save spots, submit new finds, and help the community keep deals fresh.
                </p>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <form action={handleSubmit} className="space-y-5">
              <FormField htmlFor="signup-name" label="Name" required>
                <Input id="signup-name" type="text" name="name" required placeholder="Your Name" />
              </FormField>

              <FormField htmlFor="signup-email" label="Email" required>
                <Input id="signup-email" type="email" name="email" required placeholder="you@example.com" />
              </FormField>

              <FormField
                htmlFor="signup-password"
                label="Password"
                required
                hint="Use at least 8 characters with both letters and numbers."
              >
                <Input
                  id="signup-password"
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                />
              </FormField>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/signin" className="font-medium text-orange-300 hover:text-white">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-orange-500/15 bg-gradient-to-br from-white/[0.04] via-orange-500/12 to-white/[0.02] p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_28%)]" />
          <div className="relative space-y-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-200">
              <LogoMark size={24} />
            </div>
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-gray-300">
                <SparklesIcon size={14} />
                New member perks
              </span>
              <div className="space-y-3">
                <p className="text-xl font-semibold text-white sm:text-2xl">
                  Built for people who actually want to know where dinner is worth going tonight.
                </p>
                <p className="max-w-xl text-base leading-7 text-gray-300">
                  From late-night specials to kid-friendly weeknight staples, DailyFoodDeals keeps the best local offers organized and easy to act on.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                "Save restaurants and deals you want to revisit.",
                "Submit new neighborhood finds in a cleaner, guided flow.",
                "Help verify active deals so the feed stays trustworthy.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="mt-0.5 text-orange-300">
                    <CheckCircleIcon size={18} />
                  </div>
                  <p className="text-sm leading-6 text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

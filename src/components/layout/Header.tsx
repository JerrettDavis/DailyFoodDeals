"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { LogoMark, MenuIcon, PlusIcon, SparklesIcon, XIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const coreLinks = [
  { href: "/deals", label: "Today's Deals" },
  { href: "/submit", label: "Submit Deal" },
] as const;

function NavLink({
  href,
  label,
  active,
  mobile = false,
}: {
  href: string;
  label: string;
  active: boolean;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "transition-colors",
        mobile
          ? active
            ? "text-white"
            : "text-gray-300 hover:text-white"
          : active
            ? "rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-100"
            : "text-sm text-gray-300 hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}

function HeaderShell({
  pathname,
  links,
  menuOpen,
  setMenuOpen,
  desktopActions,
  mobileActions,
}: {
  pathname: string;
  links: Array<{ href: string; label: string }>;
  menuOpen: boolean;
  setMenuOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  desktopActions: React.ReactNode;
  mobileActions: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d12]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-300">
              <LogoMark size={22} />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-white">DailyFoodDeals</p>
              <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Find food worth leaving for</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {links.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} active={pathname.startsWith(link.href)} />
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">{desktopActions}</div>

          <button
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>

        {menuOpen ? (
          <div className="space-y-5 border-t border-white/10 py-5 lg:hidden">
            <div className="grid gap-3">
              {links.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  active={pathname.startsWith(link.href)}
                  mobile
                />
              ))}
            </div>
            {mobileActions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function AuthEnabledHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const sessionState = useSession();
  const session = sessionState?.data ?? null;
  const adminEnabled = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  const links = [
    ...coreLinks,
    ...(adminEnabled ? [{ href: "/admin", label: "Manage" }] : []),
    ...(session ? [{ href: "/favorites", label: "Favorites" }] : []),
  ];

  return (
    <HeaderShell
      pathname={pathname}
      links={links}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      desktopActions={
        session ? (
          <>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
              {session.user?.name ?? session.user?.email ?? "Signed in"}
            </div>
            <button className={buttonVariants({ variant: "secondary" })} onClick={() => signOut()}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/signin" className={buttonVariants({ variant: "secondary" })}>
              Sign In
            </Link>
            <Link href="/submit" className={buttonVariants({ variant: "primary" })}>
              <PlusIcon size={16} />
              Submit Deal
            </Link>
          </>
        )
      }
      mobileActions={
        session ? (
          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-300">
              {session.user?.name ?? session.user?.email ?? "Signed in"}
            </div>
            <button className={buttonVariants({ variant: "secondary", className: "w-full" })} onClick={() => signOut()}>
              Sign Out
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            <Link href="/auth/signin" className={buttonVariants({ variant: "secondary", className: "w-full" })}>
              Sign In
            </Link>
            <Link href="/submit" className={buttonVariants({ variant: "primary", className: "w-full" })}>
              <PlusIcon size={16} />
              Submit Deal
            </Link>
          </div>
        )
      }
    />
  );
}

function AuthDisabledHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <HeaderShell
      pathname={pathname}
      links={[...coreLinks]}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      desktopActions={
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          <SparklesIcon size={16} />
          Sign-in unavailable
        </div>
      }
      mobileActions={
        <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <SparklesIcon size={16} />
          Sign-in unavailable
        </div>
      }
    />
  );
}

export function Header({ authEnabled }: { authEnabled: boolean }) {
  return authEnabled ? <AuthEnabledHeader /> : <AuthDisabledHeader />;
}

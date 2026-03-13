"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🍔</span>
            <span className="text-xl font-bold text-orange-500">DailyFoodDeals</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/deals" className="text-gray-300 hover:text-orange-500 transition-colors">Today&apos;s Deals</Link>
            <Link href="/submit" className="text-gray-300 hover:text-orange-500 transition-colors">Submit Deal</Link>
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className="text-gray-300 hover:text-orange-500 transition-colors">Admin</Link>
            )}
            {session ? (
              <>
                <Link href="/favorites" className="text-gray-300 hover:text-orange-500 transition-colors">Favorites</Link>
                <button
                  onClick={() => signOut()}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </nav>
          <button className="md:hidden text-gray-300" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/deals" className="block text-gray-300 hover:text-orange-500 py-2">Today&apos;s Deals</Link>
            <Link href="/submit" className="block text-gray-300 hover:text-orange-500 py-2">Submit Deal</Link>
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className="block text-gray-300 hover:text-orange-500 py-2">Admin</Link>
            )}
            {session ? (
              <>
                <Link href="/favorites" className="block text-gray-300 hover:text-orange-500 py-2">Favorites</Link>
                <button onClick={() => signOut()} className="block text-orange-500 py-2">Sign Out</button>
              </>
            ) : (
              <Link href="/auth/signin" className="block text-orange-500 py-2">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

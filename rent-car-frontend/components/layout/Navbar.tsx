"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";
import { clientFetch } from "@/lib/api/client";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-white">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13" />
          <path d="M5 13h14v4a1 1 0 01-1 1h-1.5a1 1 0 01-1-1v-1h-7v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-4z" />
        </svg>
      </div>
      <span className="text-[15px] font-semibold tracking-tight text-white">
        Rent<span className="opacity-60">Car</span>
      </span>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-zinc-800 text-white"
          : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const { email, role, logout } = useAuthStore();
  const router = useRouter();
  const isLoggedIn = !!email;

  const initials = email
    ? email.slice(0, 2).toUpperCase()
    : "";

  async function handleLogout() {
    await clientFetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/vehicles");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex h-14 max-w-8xl items-center gap-6 px-6">
        <Link href="/vehicles" className="flex items-center">
          <Logo />
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/vehicles">Vehicles</NavLink>
          {role === "USER" && (
            <NavLink href="/reservations">My Reservations</NavLink>
          )}
          {role === "ADMIN" && (
            <NavLink href="/admin/reservations">Admin</NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="primary" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          ) : (
            <>
              <button className="grid h-9 w-9 place-items-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white">
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 rounded-md py-1 pl-1 pr-3 hover:bg-zinc-800">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-zinc-700 text-[11px] font-medium">
                  {initials}
                </div>
                <div className="hidden text-left leading-tight sm:block">
                  <div className="text-xs font-medium">{email}</div>
                  <div className="text-[10px] text-zinc-400">{role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="grid h-9 w-9 place-items-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

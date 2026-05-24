"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, Car, BarChart2, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { clientFetch } from "@/lib/api/client";

const NAV_ITEMS = [
  { href: "/admin/reservations", label: "Reservations", Icon: Calendar },
  { href: "/admin/vehicles", label: "Vehicles", Icon: Car },
  { href: "/admin/report", label: "Report", Icon: BarChart2 },
];

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

export function AdminSidebar() {
  const pathname = usePathname();
  const { email, logout } = useAuthStore();
  const router = useRouter();

  const initials = email ? email.slice(0, 2).toUpperCase() : "AD";

  async function handleLogout() {
    await clientFetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/vehicles");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-[244px] flex-col border-r border-zinc-800/60 bg-zinc-950 text-zinc-100 sticky top-0">
      <div className="flex h-14 items-center border-b border-zinc-800/60 px-5">
        <Logo />
      </div>

      <div className="px-3 pb-1 pt-4">
        <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Admin
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition ${
                active
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px] opacity-80" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-800/60 p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-[11px] font-medium text-white">
            {initials}
          </div>
          <div className="leading-tight overflow-hidden">
            <div className="text-xs font-medium truncate">Admin</div>
            <div className="text-[10px] text-zinc-400 truncate">{email}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="ml-auto grid h-7 w-7 place-items-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white flex-shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

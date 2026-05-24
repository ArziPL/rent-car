import { Navbar } from "@/components/layout/Navbar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="mx-auto w-full max-w-8xl px-6 py-10 text-xs text-zinc-400">
        © {new Date().getFullYear()} RentCar · Built with Next.js, Tailwind CSS, shadcn/ui
      </footer>
    </div>
  );
}

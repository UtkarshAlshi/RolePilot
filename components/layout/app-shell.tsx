import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/profile", label: "Profile" },
  { href: "/jobs/new", label: "New Job" },
  { href: "/applications", label: "Applications" }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r bg-white p-4">
        <h1 className="text-lg font-semibold">AI Job Copilot</h1>
        <nav className="mt-6 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded px-3 py-2 text-sm hover:bg-slate-100">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-8">{children}</main>
    </div>
  );
}

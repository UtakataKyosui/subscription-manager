"use client";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/todos", label: "Todos" },
    { to: "/subscriptions", label: "Subscriptions" },
    { to: "/calendar", label: "Calendar" },
  ] as const;

  return (
    <div className="w-full">
      <div className="container mx-auto flex flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        <nav className="flex gap-4 text-lg items-center text-sm sm:text-base font-medium">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to} className="hover:text-primary transition-colors">
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}

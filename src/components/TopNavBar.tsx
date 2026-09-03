"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = Object.freeze([
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/library", label: "Library" },
  { path: "/wordle", label: "Wordle" },
  { path: "/wordsearch", label: "Word Search" },
  { path: "/settings", label: "Settings" },
]);

const navLinkClass =
  "text-slate-900 hover:text-slate-100 hover:bg-slate-900 dark:text-slate-100 dark:hover:text-slate-900 dark:hover:bg-slate-100 px-3 py-2 rounded-md";

export function TopNavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  function toggleDrawer() {
    setDrawerOpen((isOpen) => !isOpen);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  const drawerVisibilityClass = drawerOpen ? "flex" : "hidden";

  return (
    <nav className="bg-slate-100 dark:bg-slate-900 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between md:hidden">
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Menu
          </span>
          <button
            type="button"
            onClick={toggleDrawer}
            aria-label="Toggle navigation menu"
            aria-expanded={drawerOpen}
            className="rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <img src="/hamburger.svg" alt="" className="h-7 w-7 dark:invert" />
          </button>
        </div>

        <ul
          className={`mt-3 flex flex-col gap-2 text-lg font-medium md:mt-0 md:flex md:flex-row md:gap-4 ${drawerVisibilityClass} md:flex`}
        >
          {NAV_LINKS.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                aria-current={pathname === item.path ? "page" : undefined}
                onClick={closeDrawer}
                className={navLinkClass}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default TopNavBar;

"use client";

import { usePathname } from "next/navigation";

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide navbar on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  
  return <>{children}</>;
}


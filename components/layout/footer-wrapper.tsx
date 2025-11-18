"use client";

import { usePathname } from "next/navigation";

export function FooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide footer on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  
  return <>{children}</>;
}


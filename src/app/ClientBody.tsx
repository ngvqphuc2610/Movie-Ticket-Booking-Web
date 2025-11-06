"use client";

import clsx from "clsx";
import { type ReactNode, useEffect } from "react";

interface ClientBodyProps {
  children: ReactNode;
  className?: string;
}

export default function ClientBody({ children, className }: ClientBodyProps) {
  const appliedClassName = clsx("antialiased", className).trim();

  useEffect(() => {
    document.body.className = appliedClassName;

    document.body
      .getAttributeNames()
      .filter((name) => name.startsWith("__processed_"))
      .forEach((name) => document.body.removeAttribute(name));
  }, [appliedClassName]);

  return (
    <body className={appliedClassName} suppressHydrationWarning>
      {children}
    </body>
  );
}

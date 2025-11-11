import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      {children}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeTogglerTwo />
      </div>
    </ThemeProvider>
  );
}

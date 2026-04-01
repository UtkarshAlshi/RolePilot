import "./globals.css";
import { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/lib/wagmi";

export const metadata: Metadata = {
  title: "Token Research Lab",
  description: "Testnet panel for wallet token display security research",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

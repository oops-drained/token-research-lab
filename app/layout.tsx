import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/lib/wagmi";
import { FactoryConfigProvider } from "@/lib/factory-config";

export const metadata: Metadata = {
  title: "Token Research Lab",
  description: "Testnet panel for wallet token display security research",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>
          <FactoryConfigProvider>{children}</FactoryConfigProvider>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Influencer AI",
  description: "SaaS para conectar influencers con marcas mediante IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

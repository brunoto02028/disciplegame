import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O Discípulo - Gamificação de Turismo Religioso",
  description: "Siga as viagens do Apóstolo Paulo em uma corrida de conhecimento interativa. Aprenda sobre história bíblica, geografia e turismo religioso.",
  keywords: ["turismo religioso", "Apóstolo Paulo", "jogo educativo", "bíblia", "cristianismo"],
  authors: [{ name: "Ricardo Almeida - Usine Criative" }],
  openGraph: {
    title: "O Discípulo",
    description: "Gamificação de Turismo Religioso",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

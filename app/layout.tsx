import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language";
import { GameProvider } from "@/lib/game-context";
import { UserProvider } from "@/lib/user-context";
import Navbar from "@/components/Navbar";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ToyBox",
  description: "Una caja de juguetes digital llena de experimentos web interactivos y minijuegos creativos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <GameProvider>
              <UserProvider>
                <div className="min-h-screen pb-16 bg-white dark:bg-gray-950 transition-colors"> {/* Add padding for player */}
                  <Navbar />
                  {children}
                </div>
                <GlobalMusicPlayer />
              </UserProvider>
            </GameProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

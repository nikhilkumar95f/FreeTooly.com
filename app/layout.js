import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoritesBar from "@/components/FavoritesBar";
import ToasterProvider from "@/components/ToasterProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "FreeTooly – 100+ Free Online Tools",
  description:
    "Free online tools for text, code, conversion, cryptography, random generators, and everyday tasks. No signup required. Over 100+ tools ready to use.",
  keywords: "free online tools, text tools, code tools, converter, cryptography, random generator",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="bg-page text-main min-h-screen transition-colors duration-200">
        <ThemeProvider>
          <Header />
          <FavoritesBar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}

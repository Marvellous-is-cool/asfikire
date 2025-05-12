import "./globals.css";
import { Inter, Montserrat, Playfair_Display } from "next/font/google";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { SettingsProvider } from "../contexts/SettingsContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "Anglican Student Fellowship - Ikire Branch",
  description:
    "Anglican Student Fellowship, Ikire Branch - Arise, Shine! Join our community and vote for your favorite shirt design.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${montserrat.variable} ${playfair.variable} font-sans bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen`}
      >
        <SettingsProvider>
          <div className="fixed inset-0 -z-10 bg-[url('/patterns/grid-light.svg')] bg-fixed opacity-[0.02]" />
          <Navbar />
          <main className="mx-auto pt-20">{children}</main>
          <Footer />
        </SettingsProvider>
      </body>
    </html>
  );
}

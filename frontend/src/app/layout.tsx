import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { SimulationProvider } from "../context/SimulationContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SmartCool Energy Saver — Multi-Room Cooling Simulation",
  description: "Modern energy-efficiency multi-room cooling control and simulation suite.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`} data-theme="dark">
      <body className="min-h-screen flex flex-col antialiased">
        <SimulationProvider>
          <Header />
          <div className="flex-1 flex min-w-0 relative">
            <Sidebar />
            <div className="flex-1 min-w-0 bg-[var(--bg)] min-h-[calc(100vh-65px)] pb-16 lg:pb-0">
              {children}
            </div>
          </div>
        </SimulationProvider>
      </body>
    </html>
  );
}

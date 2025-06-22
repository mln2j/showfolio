import type { Metadata } from "next";

import "./globals.css";



export const metadata: Metadata = {
  title: "Showfolio",
  description: "Showfolio – your modern portfolio platform",
};

import {NavBar} from "@/components/NavBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
      <body>
      <NavBar />
      {children}
      </body>
      </html>
  );
}


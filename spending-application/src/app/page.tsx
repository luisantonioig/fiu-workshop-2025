"use client";
import "./globals.css";
import "@meshsdk/react/styles.css";

import { Navbar } from "./_components/Navbar";
import Spend from "./_components/Spend";

export default function SpendingAppication() {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <Navbar />
      <Spend />
    </div>
  );
}

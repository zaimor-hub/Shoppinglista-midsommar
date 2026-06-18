"use client";

import { useState } from "react";
import ShoppingList from "@/components/ShoppingList";
import MenuPlanning from "@/components/MenuPlanning";

export default function Home() {
  const [tab, setTab] = useState<"list" | "menu">("list");

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className="mb-5 text-center">
        <h1 className="text-3xl font-bold text-green-800">
          🌸 Midsommarlistan
        </h1>
        <p className="text-green-600 text-sm mt-1">
          Alla med länken kan lägga till och bocka av
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab("list")}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
            tab === "list"
              ? "bg-green-600 text-white"
              : "bg-white text-green-700 border border-green-200"
          }`}
        >
          Shoppinglista
        </button>
        <button
          type="button"
          onClick={() => setTab("menu")}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
            tab === "menu"
              ? "bg-green-600 text-white"
              : "bg-white text-green-700 border border-green-200"
          }`}
        >
          Menyplanering
        </button>
      </div>

      {tab === "list" ? <ShoppingList /> : <MenuPlanning />}
    </main>
  );
}

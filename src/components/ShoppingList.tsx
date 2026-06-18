"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, type ShoppingItem } from "@/lib/supabase";

const CATEGORIES = [
  "Mat",
  "Dryck",
  "Grillat",
  "Snacks & godis",
  "Frukt & grönt",
  "Dairy",
  "Övrigt",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Mat": "bg-orange-100 text-orange-800",
  "Dryck": "bg-blue-100 text-blue-800",
  "Grillat": "bg-red-100 text-red-800",
  "Snacks & godis": "bg-yellow-100 text-yellow-800",
  "Frukt & grönt": "bg-green-100 text-green-800",
  "Dairy": "bg-purple-100 text-purple-800",
  "Övrigt": "bg-gray-100 text-gray-800",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-800";
}

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Övrigt");
  const [quantity, setQuantity] = useState("1");
  const [adding, setAdding] = useState(false);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .order("category")
      .order("created_at");

    if (error) {
      setError("Kunde inte hämta listan. Kontrollera Supabase-konfigurationen.");
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel("shopping_items_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_items" },
        () => fetchItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    const { error } = await supabase.from("shopping_items").insert({
      name: name.trim(),
      category,
      quantity: quantity.trim() || "1",
      checked: false,
    });

    if (error) {
      setError("Kunde inte lägga till varan.");
    } else {
      setName("");
      setQuantity("1");
    }
    setAdding(false);
  }

  async function toggleChecked(item: ShoppingItem) {
    await supabase
      .from("shopping_items")
      .update({ checked: !item.checked })
      .eq("id", item.id);
  }

  async function deleteItem(id: string) {
    await supabase.from("shopping_items").delete().eq("id", id);
  }

  const grouped = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const sortedCategories = Object.keys(grouped).sort((a, b) =>
    a.localeCompare(b, "sv")
  );

  const uncheckedCount = items.filter((i) => !i.checked).length;

  return (
    <div className="space-y-4">
      {/* Add item form */}
      <form
        onSubmit={addItem}
        className="bg-white rounded-2xl shadow-sm border border-green-100 p-4 space-y-3"
      >
        <h2 className="font-semibold text-green-800 text-base">Lägg till vara</h2>

        <input
          type="text"
          placeholder="Vad ska handlas?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Antal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-24 border border-gray-200 rounded-xl px-3 py-3 text-base text-center focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <button
          type="submit"
          disabled={adding || !name.trim()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl text-base transition-colors"
        >
          {adding ? "Lägger till…" : "+ Lägg till"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      {/* Summary */}
      {!loading && items.length > 0 && (
        <p className="text-sm text-green-700 text-center">
          {uncheckedCount === 0
            ? "Allt är handlat! 🎉"
            : `${uncheckedCount} av ${items.length} varor kvar`}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center text-green-600 py-8">Laddar listan…</div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Listan är tom — lägg till det första!
        </div>
      )}

      {/* Grouped items */}
      {sortedCategories.map((cat) => (
        <div key={cat} className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
          <div className={`px-4 py-2 text-sm font-semibold ${getCategoryColor(cat)}`}>
            {cat}
          </div>
          <ul className="divide-y divide-gray-50">
            {grouped[cat].map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <button
                  onClick={() => toggleChecked(item)}
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    item.checked
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 hover:border-green-400"
                  }`}
                  aria-label={item.checked ? "Avmarkera" : "Markera som handlad"}
                >
                  {item.checked && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <span
                  className={`flex-1 text-base ${
                    item.checked ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {item.name}
                </span>

                <span className="text-sm text-gray-400 flex-shrink-0">
                  {item.quantity}
                </span>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                  aria-label="Ta bort vara"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

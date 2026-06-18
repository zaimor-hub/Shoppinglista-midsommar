"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function MenuPlanning() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNote = useCallback(async () => {
    const { data } = await supabase
      .from("menu_notes")
      .select("content")
      .eq("id", 1)
      .maybeSingle();
    setContent(data?.content ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  async function saveNote(text: string) {
    setStatus("saving");
    await supabase
      .from("menu_notes")
      .upsert({ id: 1, content: text }, { onConflict: "id" });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setContent(text);
    setStatus("idle");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNote(text), 1000);
  }

  if (loading) {
    return <div className="text-center text-green-600 py-8">Laddar…</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-green-800 text-base">Menyplanering</h2>
        <span className="text-xs text-gray-400 min-w-[60px] text-right">
          {status === "saving" && "Sparar…"}
          {status === "saved" && "Sparat ✓"}
        </span>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Skriv ditt menyförslag här…"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 resize-none min-h-[300px]"
      />
    </div>
  );
}

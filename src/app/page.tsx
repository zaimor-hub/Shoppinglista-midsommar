import ShoppingList from "@/components/ShoppingList";

export default function Home() {
  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-green-800">
          🌸 Midsommarlistan
        </h1>
        <p className="text-green-600 text-sm mt-1">
          Alla med länken kan lägga till och bocka av
        </p>
      </div>
      <ShoppingList />
    </main>
  );
}

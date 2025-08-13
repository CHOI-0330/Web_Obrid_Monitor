import Link from "next/link";
import { EventDisplay } from "../components/EventDisplay";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="font-semibold">mimamoriD</span>
          </div>
          <Link href="/grap" className="btn">Open Graph</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <EventDisplay />
      </main>
    </div>
  );
}

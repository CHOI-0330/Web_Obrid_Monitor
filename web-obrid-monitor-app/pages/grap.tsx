import Link from "next/link";
import Grap from "../components/Grap";

export default function GrapPage() {
  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="font-semibold">mimamoriD</span>
          </div>
          <Link href="/" className="btn">Back</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Grap />
      </main>
    </div>
  );
}

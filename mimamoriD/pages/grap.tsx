import dynamic from "next/dynamic";

const Grap = dynamic(() => import("../components/Grap").then(m => m.default), { ssr: false });

export default function GrapPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Grap />
      </main>
    </div>
  );
}

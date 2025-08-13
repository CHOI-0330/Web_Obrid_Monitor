import Link from "next/link";
import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("../components/mimamori/PatientMonitoringDashboard").then(m => m.PatientMonitoringDashboard), { ssr: false });

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="font-semibold">mimamoriD</span>
          </div>
          <nav className="flex gap-2">
            <Link href="/" className="btn">Home</Link>
            <Link href="/grap" className="btn">Graph</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Dashboard />
      </main>
    </div>
  );
}

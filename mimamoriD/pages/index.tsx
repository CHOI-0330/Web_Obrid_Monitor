import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("../components/PatientMonitoringDashboard").then(m => m.PatientMonitoringDashboard), { ssr: false });

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Dashboard />
      </main>
    </div>
  );
}

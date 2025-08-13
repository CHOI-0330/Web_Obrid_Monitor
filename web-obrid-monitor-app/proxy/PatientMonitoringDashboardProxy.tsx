"use client";
// @ts-nocheck
export default function PatientMonitoringDashboardProxy() {
  const Comp = require("../../mimamoriD/components/PatientMonitoringDashboard");
  const PatientMonitoringDashboard = Comp.PatientMonitoringDashboard ?? Comp.default;
  return <PatientMonitoringDashboard />;
}

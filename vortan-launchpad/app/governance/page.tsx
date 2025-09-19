"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { GovernancePage as GovernancePageComponent } from "@/components/governance/governance-page";

export default function GovernancePage() {
  return (
    <MainLayout>
      <GovernancePageComponent />
    </MainLayout>
  );
}

"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { FaucetPage as FaucetPageComponent } from "@/components/faucet/faucet-page";

export default function FaucetPage() {
  return (
    <MainLayout>
      <FaucetPageComponent />
    </MainLayout>
  );
}



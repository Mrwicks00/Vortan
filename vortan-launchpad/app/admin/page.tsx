"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { CreateSaleForm } from "@/components/admin/create-sale-form";
import { SalesList } from "@/components/admin/sales-list";
import { TokenDepositForm } from "@/components/admin/token-deposit-form";
import { useProjects } from "@/lib/web3/hooks/use-projects";
import { toast } from "react-toastify";

export default function AdminPage() {
  const { projects, isLoading, error } = useProjects();

  const handleCreateSale = (projectData: any) => {
    toast.success(`${projectData.name} project has been created successfully!`);
  };

  const handleDepositTokens = (saleAddress: string) => {
    const project = projects.find((p) => p.sale_address === saleAddress);
    if (project) {
      toast.info(
        `Token deposit for ${project.name} - Smart contract integration coming soon!`
      );
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-destructive">Error loading projects: {error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="font-heading text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create and manage token sales across the Vortan launchpad platform
          </p>
        </div>

        <CreateSaleForm onSubmit={handleCreateSale} />

        {/* Unfunded Projects Section */}
        {projects.filter((p) => p.sale?.fundingStatus === "Unfunded").length >
          0 && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-bold text-orange-500">
              Unfunded Projects - Deposit Tokens
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects
                .filter(
                  (p) => p.sale?.fundingStatus === "Unfunded" && p.sale_address
                )
                .map((project) => (
                  <TokenDepositForm
                    key={project.sale_address}
                    saleAddress={project.sale_address!}
                    saleTokenAddress={project.sale?.saleTokenAddress || ""}
                    projectOwner={project.sale?.projectOwner || ""}
                  />
                ))}
            </div>
          </div>
        )}

        <SalesList projects={projects} onDepositTokens={handleDepositTokens} />
      </div>
    </MainLayout>
  );
}

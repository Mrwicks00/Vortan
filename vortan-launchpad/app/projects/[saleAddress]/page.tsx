"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { ProjectHeader } from "@/components/projects/project-header";
import { SalePanel } from "@/components/projects/sale-panel";
import { ClaimsPanel } from "@/components/projects/claims-panel";
import { UserTierDisplay } from "@/components/projects/user-tier-display";
import { TokenDepositForm } from "@/components/admin/token-deposit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, Shield } from "lucide-react";

interface ProjectDetail {
  saleAddress: string;
  meta: {
    name: string;
    symbol: string;
    bannerUrl: string;
    logoUrl: string;
    description: string;
    longDescription: string;
    website: string;
    socials: {
      x: string;
      discord: string;
      medium: string;
    };
  };
  sale: {
    baseToken: string;
    priceDisplay: string;
    hardCap: number;
    softCap: number;
    perWalletCap: number;
    tierCaps: {
      T1: number;
      T2: number;
      T3: number;
    };
    start: number;
    end: number;
    fundingStatus?: "Funded" | "Unfunded";
    tgeTime: number;
    tgeBps: number;
    vestDuration: number;
    projectOwner?: string;
  };
  stats: {
    raised: number;
    buyers: number;
    tokensSold: number;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const saleAddress = params.saleAddress as string;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/project/${saleAddress}`);
        if (!response.ok) {
          throw new Error("Project not found");
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch project"
        );
      } finally {
        setLoading(false);
      }
    };

    if (saleAddress) {
      fetchProject();
    }
  }, [saleAddress]);

  const getStatus = (
    start: number,
    end: number
  ): "Live" | "Upcoming" | "Ended" => {
    const now = Math.floor(Date.now() / 1000);
    if (now < start) return "Upcoming";
    if (now > end) return "Ended";
    return "Live";
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="glass-effect glow-border rounded-lg p-6">
            <Skeleton className="h-64 w-full rounded-lg mb-6" />
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !project) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="glass-effect glow-border rounded-lg p-12 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold text-destructive mb-2">
              Project Not Found
            </h3>
            <p className="text-muted-foreground">
              {error || "The requested project could not be found."}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const status = getStatus(project.sale.start, project.sale.end);

  return (
    <MainLayout>
      <div className="space-y-6">
        <ProjectHeader project={project.meta} status={status} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>About & Documentation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Project Overview</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.meta.longDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <h5 className="font-medium">Key Features</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Decentralized governance</li>
                      <li>• Cross-chain compatibility</li>
                      <li>• Advanced tokenomics</li>
                      <li>• Community-driven development</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium">Technology Stack</h5>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Solidity</Badge>
                      <Badge variant="outline">React</Badge>
                      <Badge variant="outline">IPFS</Badge>
                      <Badge variant="outline">The Graph</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Disclaimer */}
            <Card className="glass-effect border-destructive/30">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center space-x-2 text-destructive">
                  <Shield className="h-5 w-5" />
                  <span>Risk Disclaimer</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>Investment Risk:</strong> Token purchases involve
                  significant risk and may result in partial or total loss of
                  funds.
                </p>
                <p>
                  <strong>Regulatory Risk:</strong> Cryptocurrency regulations
                  vary by jurisdiction and may change, affecting token utility
                  and value.
                </p>
                <p>
                  <strong>Technology Risk:</strong> Smart contracts and
                  blockchain technology carry inherent technical risks including
                  bugs and vulnerabilities.
                </p>
                <p>
                  <strong>Market Risk:</strong> Token values are highly volatile
                  and may fluctuate significantly based on market conditions.
                </p>
                <p className="font-medium text-destructive">
                  Please conduct your own research and consider your risk
                  tolerance before participating in any token sale.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UserTierDisplay
              saleAddress={saleAddress}
              tierCaps={project.sale.tierCaps}
            />

            {/* Token Deposit Form - Show for unfunded projects */}
            {project.sale.fundingStatus === "Unfunded" && (
              <TokenDepositForm
                saleAddress={saleAddress}
                saleTokenAddress={project.sale.saleTokenAddress || ""}
                projectOwner={project.sale.projectOwner || ""}
              />
            )}

            <SalePanel
              saleAddress={saleAddress}
              sale={project.sale}
              stats={project.stats}
              status={status}
            />
            <ClaimsPanel saleAddress={saleAddress} sale={project.sale} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

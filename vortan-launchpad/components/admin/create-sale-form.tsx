"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Rocket,
  DollarSign,
  Calendar,
  Settings,
  Globe,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useProjects } from "@/lib/web3/hooks/use-projects";
import { useSaleDeployment } from "@/lib/web3/hooks/use-sale-deployment";
import { storageApi } from "@/lib/supabase/storage";
import { ImageUpload } from "@/components/ui/image-upload";
import { BaseTokenType } from "@/lib/web3/utils/token-resolver";

interface CreateSaleFormProps {
  onSubmit: (formData: any) => void;
}

export function CreateSaleForm({ onSubmit }: CreateSaleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const { createProject, updateProject } = useProjects();
  const {
    deploySale,
    isDeploying,
    isDeployPending,
    isDeploySuccess,
    deploymentError,
    deployHash,
    saleAddress,
  } = useSaleDeployment();

  // Update project with actual sale address when it becomes available
  useEffect(() => {
    if (saleAddress && currentProjectId) {
      updateProject(currentProjectId, {
        sale_address: saleAddress,
        status: "live",
      })
        .then(() => {
          toast.success("Contract deployed successfully! Project is now live!");
          // Redirect to the project page now that we have the sale address
          router.push(`/projects/${saleAddress}`);
        })
        .catch((error) => {
          console.error("Failed to update project with sale address:", error);
          toast.error("Failed to update project with sale address");
        });
    }
  }, [saleAddress, currentProjectId, updateProject, router]);

  // Update project with transaction hash when available
  useEffect(() => {
    if (deployHash && currentProjectId && !saleAddress) {
      updateProject(currentProjectId, {
        sale_address: deployHash,
        status: "pending",
      })
        .then(() => {
          console.log("Project updated with transaction hash:", deployHash);
        })
        .catch((error) => {
          console.error(
            "Failed to update project with transaction hash:",
            error
          );
        });
    }
  }, [deployHash, currentProjectId, saleAddress, updateProject]);

  // Handle deployment errors
  useEffect(() => {
    if (deploymentError) {
      toast.error(`Contract deployment failed: ${deploymentError}`);
    }
  }, [deploymentError]);

  // Show loading toast when transaction is pending
  useEffect(() => {
    if (isDeployPending && currentProjectId) {
      toast.info("Transaction submitted! Waiting for confirmation...");
    }
  }, [isDeployPending, currentProjectId]);

  const [formData, setFormData] = useState({
    // Token Info
    tokenAddress: "",
    baseToken: "USDC" as BaseTokenType,
    price: "",
    hardCap: "",
    softCap: "",

    // Caps
    perWalletCap: "",
    tierCapT1: "",
    tierCapT2: "",
    tierCapT3: "",

    // Timing
    startTime: "",
    endTime: "",
    tgeTime: "",
    vestDuration: "",
    tgePercentage: "10",

    // Fees (platform controlled - not user input)
    // tokenFee: "5", // Fixed at 5%
    // feeRecipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Fixed address

    // Project Info
    projectOwner: "",
    name: "",
    symbol: "",
    website: "",
    twitter: "",
    discord: "",
    medium: "",
    shortDescription: "",
    longDescription: "",

    // Media
    bannerFile: null as File | null,
    logoFile: null as File | null,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = {
      "Project Owner": formData.projectOwner,
      "Project Name": formData.name,
      "Token Symbol": formData.symbol,
      "Short Description": formData.shortDescription,
      "Token Address": formData.tokenAddress,
      Price: formData.price,
      "Hard Cap": formData.hardCap,
      "Soft Cap": formData.softCap,
      "Start Time": formData.startTime,
      "End Time": formData.endTime,
      "TGE Time": formData.tgeTime,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === "")
      .map(([field, _]) => field);

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    // Validate numeric fields
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast.error("Price must be a valid positive number");
      return;
    }

    if (isNaN(Number(formData.hardCap)) || Number(formData.hardCap) <= 0) {
      toast.error("Hard Cap must be a valid positive number");
      return;
    }

    if (isNaN(Number(formData.softCap)) || Number(formData.softCap) <= 0) {
      toast.error("Soft Cap must be a valid positive number");
      return;
    }

    if (Number(formData.softCap) >= Number(formData.hardCap)) {
      toast.error("Soft Cap must be less than Hard Cap");
      return;
    }

    // Validate dates
    const startTime = new Date(formData.startTime).getTime();
    const endTime = new Date(formData.endTime).getTime();
    const tgeTime = new Date(formData.tgeTime).getTime();
    const now = Date.now();

    if (startTime <= now) {
      toast.error("Start Time must be in the future");
      return;
    }

    if (endTime <= startTime) {
      toast.error("End Time must be after Start Time");
      return;
    }

    if (tgeTime < endTime) {
      toast.error("TGE Time must be after End Time");
      return;
    }

    // Validate wallet address format (basic check)
    if (!formData.projectOwner.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Project Owner must be a valid wallet address (0x...)");
      return;
    }

    // Validate token address format (basic check)
    if (!formData.tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Token Address must be a valid contract address (0x...)");
      return;
    }

    setIsLoading(true);

    const submitForm = async () => {
      try {
        // First create the project to get an ID
        const newProject = await createProject({
          sale_address: null, // Will be updated after contract deployment
          project_owner: formData.projectOwner,
          name: formData.name,
          symbol: formData.symbol,
          short_description: formData.shortDescription,
          long_description: formData.longDescription,
          website: formData.website,
          twitter: formData.twitter,
          discord: formData.discord,
          medium: formData.medium,
          status: "draft",
        });

        // Set current project ID for later update
        setCurrentProjectId(newProject.id);

        // Upload images if provided
        let bannerUrl: string | undefined;
        let logoUrl: string | undefined;

        try {
          if (formData.bannerFile) {
            bannerUrl = await storageApi.uploadImage(
              formData.bannerFile,
              newProject.id,
              "banner"
            );
          }

          if (formData.logoFile) {
            logoUrl = await storageApi.uploadImage(
              formData.logoFile,
              newProject.id,
              "logo"
            );
          }

          // Update project with image URLs
          if (bannerUrl || logoUrl) {
            await updateProject(newProject.id, {
              banner_url: bannerUrl,
              logo_url: logoUrl,
            });
          }
        } catch (imageError) {
          console.error("Image upload error:", imageError);
          toast.warning(
            "Project created but image upload failed. You can update images later."
          );
        }

        // Deploy smart contract
        try {
          const txHash = await deploySale({
            saleToken: formData.tokenAddress,
            baseToken: formData.baseToken,
            price: formData.price,
            startTime: formData.startTime,
            endTime: formData.endTime,
            tgeTime: formData.tgeTime,
            tgePercentage: formData.tgePercentage,
            vestDuration: formData.vestDuration,
            hardCap: formData.hardCap,
            softCap: formData.softCap,
            perWalletCap: formData.perWalletCap,
            tierCapT1: formData.tierCapT1,
            tierCapT2: formData.tierCapT2,
            tierCapT3: formData.tierCapT3,
            projectOwner: formData.projectOwner,
          });

          // Update project with pending status (sale address will be updated after confirmation)
          await updateProject(newProject.id, {
            sale_address: null, // Will be updated when transaction is confirmed
            status: "pending",
          });

          // Show loading toast while transaction is pending
          toast.info(
            `${formData.name} project created! Contract deployment in progress...`
          );
        } catch (contractError) {
          console.error("Contract deployment failed:", contractError);
          toast.warning(
            "Project created but contract deployment failed. You can deploy it later."
          );

          // Redirect to admin page if contract deployment failed
          router.push(`/admin`);
        }

        onSubmit(newProject);

        // Reset form
        setFormData({
          tokenAddress: "",
          baseToken: "USDC",
          price: "",
          hardCap: "",
          softCap: "",
          perWalletCap: "",
          tierCapT1: "",
          tierCapT2: "",
          tierCapT3: "",
          startTime: "",
          endTime: "",
          tgeTime: "",
          vestDuration: "",
          tgePercentage: "10",
          projectOwner: "",
          name: "",
          symbol: "",
          website: "",
          twitter: "",
          discord: "",
          medium: "",
          shortDescription: "",
          longDescription: "",
          bannerFile: null,
          logoFile: null,
        });
      } catch (error) {
        console.error("Error creating project:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create project"
        );
      } finally {
        setIsLoading(false);
      }
    };

    submitForm();
  };

  const formatNumber = (num: string) => {
    if (!num) return "";
    return new Intl.NumberFormat().format(Number.parseFloat(num));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Token Configuration */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Token Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tokenAddress">Token Address (Sold) *</Label>
              <Input
                id="tokenAddress"
                placeholder="0x..."
                value={formData.tokenAddress}
                onChange={(e) =>
                  handleInputChange("tokenAddress", e.target.value)
                }
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseToken">Base Token</Label>
              <Select
                value={formData.baseToken}
                onValueChange={(value) => handleInputChange("baseToken", value)}
              >
                <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect border-border/50">
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="SOMI">SOMI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (tokens per 1 base) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="50"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hardCap">Hard Cap *</Label>
              <Input
                id="hardCap"
                type="number"
                placeholder="200000"
                value={formData.hardCap}
                onChange={(e) => handleInputChange("hardCap", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="softCap">Soft Cap *</Label>
              <Input
                id="softCap"
                type="number"
                placeholder="50000"
                value={formData.softCap}
                onChange={(e) => handleInputChange("softCap", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Caps */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-secondary" />
            <span>Allocation Caps</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="perWalletCap">Per Wallet Cap</Label>
              <Input
                id="perWalletCap"
                type="number"
                placeholder="1000"
                value={formData.perWalletCap}
                onChange={(e) =>
                  handleInputChange("perWalletCap", e.target.value)
                }
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tierCapT1">T1 Cap</Label>
              <Input
                id="tierCapT1"
                type="number"
                placeholder="1000"
                value={formData.tierCapT1}
                onChange={(e) => handleInputChange("tierCapT1", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tierCapT2">T2 Cap</Label>
              <Input
                id="tierCapT2"
                type="number"
                placeholder="2000"
                value={formData.tierCapT2}
                onChange={(e) => handleInputChange("tierCapT2", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tierCapT3">T3 Cap</Label>
              <Input
                id="tierCapT3"
                type="number"
                placeholder="5000"
                value={formData.tierCapT3}
                onChange={(e) => handleInputChange("tierCapT3", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing Configuration */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-accent" />
            <span>Timing & Vesting</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tgeTime">TGE Time *</Label>
              <Input
                id="tgeTime"
                type="datetime-local"
                value={formData.tgeTime}
                onChange={(e) => handleInputChange("tgeTime", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tgePercentage">TGE Percentage</Label>
              <Input
                id="tgePercentage"
                type="number"
                placeholder="10"
                value={formData.tgePercentage}
                onChange={(e) =>
                  handleInputChange("tgePercentage", e.target.value)
                }
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vestDuration">Vest Duration (months)</Label>
              <Input
                id="vestDuration"
                type="number"
                placeholder="6"
                value={formData.vestDuration}
                onChange={(e) =>
                  handleInputChange("vestDuration", e.target.value)
                }
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Information */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary" />
            <span>Project Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Andromeda Quest"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Token Symbol *</Label>
              <Input
                id="symbol"
                placeholder="ANDQ"
                value={formData.symbol}
                onChange={(e) => handleInputChange("symbol", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectOwner">Project Owner *</Label>
              <Input
                id="projectOwner"
                placeholder="0x..."
                value={formData.projectOwner}
                onChange={(e) =>
                  handleInputChange("projectOwner", e.target.value)
                }
                className="bg-input/50 border-border/50 focus:border-primary/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description *</Label>
            <Input
              id="shortDescription"
              placeholder="AI-powered MMO set in the Andromeda galaxy"
              value={formData.shortDescription}
              onChange={(e) =>
                handleInputChange("shortDescription", e.target.value)
              }
              className="bg-input/50 border-border/50 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longDescription">Long Description (Optional)</Label>
            <Textarea
              id="longDescription"
              placeholder="Detailed project description..."
              value={formData.longDescription}
              onChange={(e) =>
                handleInputChange("longDescription", e.target.value)
              }
              className="bg-input/50 border-border/50 focus:border-primary/50 min-h-[100px]"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                placeholder="https://project.example"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter (Optional)</Label>
              <Input
                id="twitter"
                placeholder="https://x.com/project"
                value={formData.twitter}
                onChange={(e) => handleInputChange("twitter", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discord">Discord (Optional)</Label>
              <Input
                id="discord"
                placeholder="https://discord.gg/project"
                value={formData.discord}
                onChange={(e) => handleInputChange("discord", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medium">Medium (Optional)</Label>
              <Input
                id="medium"
                placeholder="https://medium.com/@project"
                value={formData.medium}
                onChange={(e) => handleInputChange("medium", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center space-x-2">
            <Upload className="h-5 w-5 text-secondary" />
            <span>Media Assets</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Banner Image (Optional)</Label>
              <ImageUpload
                onFileSelect={(file) => handleFileChange("bannerFile", file)}
                currentFile={formData.bannerFile}
                accept="image/*"
              />
            </div>
            <div className="space-y-2">
              <Label>Logo Image (Optional)</Label>
              <ImageUpload
                onFileSelect={(file) => handleFileChange("logoFile", file)}
                currentFile={formData.logoFile}
                accept="image/*"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Configuration */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-accent" />
            <span>Platform Fee Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tokenFee">Platform Fee (%)</Label>
              <Input
                id="tokenFee"
                type="number"
                value="5"
                disabled
                className="bg-muted/50 border-muted/50 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Platform fee is fixed at 5% and cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeRecipient">Fee Recipient</Label>
              <Input
                id="feeRecipient"
                value="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
                disabled
                className="bg-muted/50 border-muted/50 text-muted-foreground cursor-not-allowed font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Platform treasury address (fixed)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          size="lg"
          disabled={isLoading || isDeploying}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-all duration-300 animate-glow px-8"
        >
          {isLoading || isDeploying ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {isDeploying ? "Deploying Contract..." : "Creating Project..."}
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5 mr-2" />
              Launch Sale
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

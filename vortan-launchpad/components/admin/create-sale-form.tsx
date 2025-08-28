"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Upload, Rocket, DollarSign, Calendar, Settings, Globe, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateSaleFormProps {
  onSubmit: (formData: any) => void
}

export function CreateSaleForm({ onSubmit }: CreateSaleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    // Token Info
    tokenAddress: "",
    baseToken: "USDC",
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

    // Fees
    tokenFee: "5",
    feeRecipient: "",

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
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sale Created Successfully",
          description: `${formData.name} sale has been created with address ${result.data.saleAddress}`,
        })
        onSubmit(result.data)

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
          tokenFee: "5",
          feeRecipient: "",
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
        })
      } else {
        throw new Error(result.error || "Failed to create sale")
      }
    } catch (error) {
      console.error("Error creating sale:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create sale",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: string) => {
    if (!num) return ""
    return new Intl.NumberFormat().format(Number.parseFloat(num))
  }

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
              <Label htmlFor="tokenAddress">Token Address (Sold)</Label>
              <Input
                id="tokenAddress"
                placeholder="0x..."
                value={formData.tokenAddress}
                onChange={(e) => handleInputChange("tokenAddress", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseToken">Base Token</Label>
              <Select value={formData.baseToken} onValueChange={(value) => handleInputChange("baseToken", value)}>
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
              <Label htmlFor="price">Price (tokens per 1 base)</Label>
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
              <Label htmlFor="hardCap">Hard Cap</Label>
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
              <Label htmlFor="softCap">Soft Cap</Label>
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
                onChange={(e) => handleInputChange("perWalletCap", e.target.value)}
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
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
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
              <Label htmlFor="tgeTime">TGE Time</Label>
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
                onChange={(e) => handleInputChange("tgePercentage", e.target.value)}
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
                onChange={(e) => handleInputChange("vestDuration", e.target.value)}
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
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="Andromeda Quest"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Token Symbol</Label>
              <Input
                id="symbol"
                placeholder="ANDQ"
                value={formData.symbol}
                onChange={(e) => handleInputChange("symbol", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectOwner">Project Owner</Label>
              <Input
                id="projectOwner"
                placeholder="0x..."
                value={formData.projectOwner}
                onChange={(e) => handleInputChange("projectOwner", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              placeholder="AI-powered MMO set in the Andromeda galaxy"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange("shortDescription", e.target.value)}
              className="bg-input/50 border-border/50 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longDescription">Long Description</Label>
            <Textarea
              id="longDescription"
              placeholder="Detailed project description..."
              value={formData.longDescription}
              onChange={(e) => handleInputChange("longDescription", e.target.value)}
              className="bg-input/50 border-border/50 focus:border-primary/50 min-h-[100px]"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://project.example"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                placeholder="https://x.com/project"
                value={formData.twitter}
                onChange={(e) => handleInputChange("twitter", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discord">Discord</Label>
              <Input
                id="discord"
                placeholder="https://discord.gg/project"
                value={formData.discord}
                onChange={(e) => handleInputChange("discord", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
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
              <Label htmlFor="banner">Banner Image</Label>
              <Input
                id="banner"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("bannerFile", e.target.files?.[0] || null)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground">Recommended: 1200x400px</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo Image</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("logoFile", e.target.files?.[0] || null)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground">Recommended: 200x200px</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Configuration */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-accent" />
            <span>Fee Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tokenFee">Token Fee (%)</Label>
              <Input
                id="tokenFee"
                type="number"
                placeholder="5"
                value={formData.tokenFee}
                onChange={(e) => handleInputChange("tokenFee", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeRecipient">Fee Recipient</Label>
              <Input
                id="feeRecipient"
                placeholder="0x... (Treasury address)"
                value={formData.feeRecipient}
                onChange={(e) => handleInputChange("feeRecipient", e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-all duration-300 animate-glow px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating Sale...
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
  )
}

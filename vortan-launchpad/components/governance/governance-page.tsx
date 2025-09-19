"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  FileText,
  Plus,
  BarChart3,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";
import { CreateProposalForm } from "./create-proposal-form";
import { ProposalsList } from "./proposals-list";
import { useGovernance } from "@/lib/web3/hooks/use-governance";
import { useAccount } from "wagmi";

export function GovernancePage() {
  const [activeTab, setActiveTab] = useState("proposals");
  const { isConnected } = useAccount();

  const { userVotingPower, votingDelay, votingPeriod, proposalThreshold } =
    useGovernance();

  const formatVotingPower = (power: string | undefined) => {
    if (!power) return "0";
    const num = parseFloat(power);
    if (num >= 1000000000000000000000) {
      return (num / 1000000000000000000000).toFixed(1) + "M";
    } else if (num >= 1000000000000000000) {
      return (num / 1000000000000000000).toFixed(1) + "K";
    } else if (num >= 1000000000000000) {
      return (num / 1000000000000000).toFixed(1) + "T";
    } else {
      return num.toLocaleString();
    }
  };

  const formatBlocks = (blocks: string | undefined) => {
    if (!blocks) return "0";
    const numBlocks = parseInt(blocks);
    const seconds = numBlocks * 15; // 15-second blocks for Somnia
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${numBlocks} blocks (~${days} day${days !== 1 ? "s" : ""})`;
    } else if (hours > 0) {
      return `${numBlocks} blocks (~${hours} hour${hours !== 1 ? "s" : ""})`;
    } else if (minutes > 0) {
      return `${numBlocks} blocks (~${minutes} minute${
        minutes !== 1 ? "s" : ""
      })`;
    } else {
      return `${numBlocks} blocks (~${seconds} second${
        seconds !== 1 ? "s" : ""
      })`;
    }
  };

  const formatProposalThreshold = (threshold: string | undefined) => {
    if (!threshold || threshold === "0") return "0 VORT";
    const num = parseFloat(threshold);
    if (num >= 1000000000000000000000) {
      return (num / 1000000000000000000000).toFixed(1) + "M VORT";
    } else if (num >= 1000000000000000000) {
      return (num / 1000000000000000000).toFixed(1) + "K VORT";
    } else if (num >= 1000000000000000) {
      return (num / 1000000000000000).toFixed(1) + "T VORT";
    } else {
      return num.toLocaleString() + " VORT";
    }
  };

  const canCreateProposals =
    isConnected && userVotingPower && userVotingPower !== "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-heading">Governance</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Participate in the decentralized governance of the Vortan ecosystem.
          Create proposals, vote on changes, and help shape the future of the
          platform.
        </p>
      </div>

      {/* Governance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect glow-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Your Voting Power
                </p>
                <p className="text-xl font-bold">
                  {formatVotingPower(userVotingPower)} VORT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect glow-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Voting Delay</p>
                <p className="text-lg font-semibold">
                  {formatBlocks(votingDelay)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect glow-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Voting Period</p>
                <p className="text-lg font-semibold">
                  {formatBlocks(votingPeriod)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect glow-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Proposal Threshold
                </p>
                <p className="text-lg font-semibold">
                  {formatProposalThreshold(proposalThreshold)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <Card className="glass-effect glow-border border-yellow-500/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium text-yellow-700">
                  Connect Your Wallet
                </p>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to participate in governance and view your
                  voting power.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="proposals" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Proposals
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Proposal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-6">
          <ProposalsList />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          {canCreateProposals ? (
            <CreateProposalForm />
          ) : (
            <Card className="glass-effect glow-border">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Cannot Create Proposals
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {!isConnected
                        ? "Connect your wallet to create proposals"
                        : "You need voting power to create proposals. Stake VORT tokens to participate in governance."}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      Required: {formatProposalThreshold(proposalThreshold)}
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      Your Power: {formatVotingPower(userVotingPower)} VORT
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Governance Info */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            How Governance Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">1. Create Proposal</h4>
              <p className="text-sm text-muted-foreground">
                Anyone with sufficient voting power can create proposals to
                change protocol parameters, add new features, or make other
                governance decisions.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">2. Vote</h4>
              <p className="text-sm text-muted-foreground">
                Token holders and stakers can vote on proposals during the
                voting period. Your voting power is based on your VORT token
                balance and staked tokens.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">3. Execute</h4>
              <p className="text-sm text-muted-foreground">
                Successful proposals can be executed by anyone after the voting
                period ends. Failed proposals are automatically rejected.
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Voting Power Sources</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• VORT token balance (checkpointed)</li>
                <li>• Staked VORT tokens (with multipliers)</li>
                <li>• Delegated voting power</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Proposal States</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  •{" "}
                  <Badge variant="secondary" className="text-xs">
                    Pending
                  </Badge>{" "}
                  - Waiting for voting to start
                </li>
                <li>
                  •{" "}
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>{" "}
                  - Currently accepting votes
                </li>
                <li>
                  •{" "}
                  <Badge variant="default" className="text-xs bg-green-500">
                    Succeeded
                  </Badge>{" "}
                  - Passed, ready to execute
                </li>
                <li>
                  •{" "}
                  <Badge variant="destructive" className="text-xs">
                    Defeated
                  </Badge>{" "}
                  - Failed to pass
                </li>
                <li>
                  •{" "}
                  <Badge variant="default" className="text-xs bg-purple-500">
                    Executed
                  </Badge>{" "}
                  - Successfully executed
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

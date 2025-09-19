"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  RefreshCw,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ProposalCard } from "./proposal-card";
import { useProposals } from "@/lib/web3/hooks/use-proposals";
import { useGovernance } from "@/lib/web3/hooks/use-governance";

type FilterState =
  | "all"
  | "active"
  | "pending"
  | "succeeded"
  | "defeated"
  | "executed";

export function ProposalsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<FilterState>("all");
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  const { proposals, loading, error, refreshProposals } = useProposals();

  const { castVote, executeProposal, isVotePending, isExecutePending } =
    useGovernance();

  const filteredProposals = proposals.filter((proposal) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.id.includes(searchTerm);

    // State filter
    const matchesState =
      filterState === "all" || proposal.state.toLowerCase() === filterState;

    return matchesSearch && matchesState;
  });

  const handleVote = async (proposalId: string, support: 0 | 1 | 2) => {
    try {
      await castVote(proposalId, support);
      // Refresh proposals to update vote status
      await refreshProposals();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleExecute = async (proposalId: string) => {
    try {
      // Find the proposal to get its details
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal) return;

      // You would need to reconstruct the proposal input for execution
      // This is a simplified version - you might need to store more proposal details
      const proposalInput = {
        targets: [], // You'd need to store these
        values: [], // You'd need to store these
        calldatas: [], // You'd need to store these
        description: proposal.description,
      };

      await executeProposal(proposalInput);
      await refreshProposals();
    } catch (error) {
      console.error("Error executing proposal:", error);
    }
  };

  const getProposalCounts = () => {
    const counts = {
      total: proposals.length,
      active: proposals.filter((p) => p.state === "Active").length,
      pending: proposals.filter((p) => p.state === "Pending").length,
      succeeded: proposals.filter((p) => p.state === "Succeeded").length,
      defeated: proposals.filter((p) => p.state === "Defeated").length,
      executed: proposals.filter((p) => p.state === "Executed").length,
    };
    return counts;
  };

  const counts = getProposalCounts();

  if (loading) {
    return (
      <Card className="glass-effect glow-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading proposals...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-effect glow-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">Failed to load proposals</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshProposals}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Governance Proposals
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshProposals}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{counts.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {counts.active}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {counts.pending}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {counts.succeeded}
              </p>
              <p className="text-sm text-muted-foreground">Succeeded</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {counts.defeated}
              </p>
              <p className="text-sm text-muted-foreground">Defeated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">
                {counts.executed}
              </p>
              <p className="text-sm text-muted-foreground">Executed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="glass-effect glow-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search proposals by ID or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filterState}
                onValueChange={(value) => setFilterState(value as FilterState)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="defeated">Defeated</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <Card className="glass-effect glow-border">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No proposals found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterState !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No proposals have been created yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={handleVote}
              onExecute={handleExecute}
              isVoting={isVotePending}
              isExecuting={isExecutePending}
            />
          ))}
        </div>
      )}
    </div>
  );
}



"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Vote,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react";
import { useGovernance } from "@/lib/web3/hooks/use-governance";
import { Proposal } from "@/lib/web3/hooks/use-proposals";

interface ProposalCardProps {
  proposal: Proposal;
  onVote?: (proposalId: string, support: 0 | 1 | 2) => void;
  onExecute?: (proposalId: string) => void;
  isVoting?: boolean;
  isExecuting?: boolean;
}

export function ProposalCard({
  proposal,
  onVote,
  onExecute,
  isVoting = false,
  isExecuting = false,
}: ProposalCardProps) {
  const [showVotingOptions, setShowVotingOptions] = useState(false);
  const { userVotingPower } = useGovernance();

  const getStateColor = (state: Proposal["state"]) => {
    switch (state) {
      case "Active":
        return "bg-blue-500";
      case "Succeeded":
      case "Executed":
        return "bg-green-500";
      case "Defeated":
      case "Canceled":
      case "Expired":
        return "bg-red-500";
      case "Pending":
      case "Queued":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStateIcon = (state: Proposal["state"]) => {
    switch (state) {
      case "Active":
        return <Clock className="h-4 w-4" />;
      case "Succeeded":
      case "Executed":
        return <CheckCircle className="h-4 w-4" />;
      case "Defeated":
      case "Canceled":
      case "Expired":
        return <XCircle className="h-4 w-4" />;
      case "Pending":
      case "Queued":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatBlockNumber = (blockNumber: bigint) => {
    return blockNumber.toString();
  };

  const formatVotes = (votes: bigint) => {
    const num = parseFloat(votes.toString());
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    } else {
      return num.toLocaleString();
    }
  };

  const getTotalVotes = () => {
    return proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  };

  const getVotePercentage = (votes: bigint) => {
    const total = getTotalVotes();
    if (total === 0n) return 0;
    return (Number(votes) / Number(total)) * 100;
  };

  const canVote =
    proposal.state === "Active" &&
    !proposal.hasVoted &&
    userVotingPower &&
    userVotingPower !== "0";
  const canExecute =
    proposal.state === "Succeeded" &&
    userVotingPower &&
    userVotingPower !== "0";

  const handleVote = (support: 0 | 1 | 2) => {
    if (onVote) {
      onVote(proposal.id, support);
      setShowVotingOptions(false);
    }
  };

  const handleExecute = () => {
    if (onExecute) {
      onExecute(proposal.id);
    }
  };

  return (
    <Card className="glass-effect glow-border hover:glow-border-strong transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">Proposal #{proposal.id}</CardTitle>
            <Badge
              variant="secondary"
              className={`${getStateColor(
                proposal.state
              )} text-white flex items-center gap-1 w-fit`}
            >
              {getStateIcon(proposal.state)}
              {proposal.state}
            </Badge>
          </div>

          <div className="text-right space-y-1">
            <p className="text-sm text-muted-foreground">Proposer</p>
            <p className="text-sm font-mono">
              {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Description</p>
          <p className="text-sm leading-relaxed line-clamp-3">
            {proposal.description}
          </p>
        </div>

        <Separator />

        {/* Voting Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Voting Results</span>
            <span className="text-sm text-muted-foreground">
              {formatVotes(getTotalVotes())} total votes
            </span>
          </div>

          <div className="space-y-2">
            {/* For Votes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">For</span>
              </div>
              <span className="text-sm font-medium">
                {formatVotes(proposal.votesFor)} (
                {getVotePercentage(proposal.votesFor).toFixed(1)}%)
              </span>
            </div>
            <Progress
              value={getVotePercentage(proposal.votesFor)}
              className="h-2"
            />

            {/* Against Votes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                <span className="text-sm">Against</span>
              </div>
              <span className="text-sm font-medium">
                {formatVotes(proposal.votesAgainst)} (
                {getVotePercentage(proposal.votesAgainst).toFixed(1)}%)
              </span>
            </div>
            <Progress
              value={getVotePercentage(proposal.votesAgainst)}
              className="h-2"
            />

            {/* Abstain Votes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Abstain</span>
              </div>
              <span className="text-sm font-medium">
                {formatVotes(proposal.votesAbstain)} (
                {getVotePercentage(proposal.votesAbstain).toFixed(1)}%)
              </span>
            </div>
            <Progress
              value={getVotePercentage(proposal.votesAbstain)}
              className="h-2"
            />
          </div>
        </div>

        <Separator />

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Voting Started</span>
            </div>
            <p className="font-mono text-sm">
              {proposal.startDate || formatBlockNumber(proposal.startBlock)}
            </p>
            <p className="text-xs text-muted-foreground">
              {proposal.timeAgo} • Block{" "}
              {formatBlockNumber(proposal.startBlock)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Voting Ends</span>
            </div>
            <p className="font-mono text-sm">
              {proposal.endDate || formatBlockNumber(proposal.endBlock)}
            </p>
            <p className="text-xs text-muted-foreground">
              {proposal.duration} duration • Block{" "}
              {formatBlockNumber(proposal.endBlock)}
            </p>
          </div>
        </div>

        {/* User Vote Status */}
        {proposal.hasVoted && (
          <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              You voted:{" "}
              <span className="font-medium capitalize">
                {proposal.userVote?.toLowerCase() || "Unknown"}
              </span>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canVote && (
            <>
              {!showVotingOptions ? (
                <Button
                  onClick={() => setShowVotingOptions(true)}
                  className="flex-1"
                  disabled={isVoting}
                >
                  <Vote className="h-4 w-4 mr-2" />
                  Vote
                </Button>
              ) : (
                <div className="flex gap-2 flex-1">
                  <Button
                    onClick={() => handleVote(1)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isVoting}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    For
                  </Button>
                  <Button
                    onClick={() => handleVote(0)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isVoting}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Against
                  </Button>
                  <Button
                    onClick={() => handleVote(2)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isVoting}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Abstain
                  </Button>
                </div>
              )}
            </>
          )}

          {canExecute && (
            <Button
              onClick={handleExecute}
              variant="default"
              disabled={isExecuting}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Execute
            </Button>
          )}

          {!canVote && !canExecute && proposal.state !== "Executed" && (
            <Button variant="outline" disabled className="flex-1">
              {proposal.hasVoted ? "Voted" : "Cannot Vote"}
            </Button>
          )}
        </div>

        {/* Loading States */}
        {(isVoting || isExecuting) && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            {isVoting ? "Processing vote..." : "Executing proposal..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

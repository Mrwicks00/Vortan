"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vote, Clock, Users, CheckCircle, XCircle } from "lucide-react";

const proposals = [
  {
    id: 1,
    title: "Increase Staking Rewards for VORT Token",
    description:
      "Proposal to increase VORT staking rewards from 12% to 15% APY to incentivize more participation.",
    status: "active",
    votesFor: 2847,
    votesAgainst: 1203,
    totalVotes: 4050,
    quorum: 5000,
    timeLeft: "2 days",
    proposer: "0x742d...35Bd",
  },
  {
    id: 2,
    title: "New Project Listing Criteria",
    description:
      "Establish stricter criteria for new project listings including mandatory security audits.",
    status: "passed",
    votesFor: 3921,
    votesAgainst: 879,
    totalVotes: 4800,
    quorum: 5000,
    timeLeft: "Ended",
    proposer: "0x8f3a...92Cd",
  },
  {
    id: 3,
    title: "Treasury Allocation for Marketing",
    description:
      "Allocate 500,000 VORT tokens from treasury for Q2 marketing initiatives.",
    status: "failed",
    votesFor: 1456,
    votesAgainst: 3344,
    totalVotes: 4800,
    quorum: 5000,
    timeLeft: "Ended",
    proposer: "0x1b7e...48Af",
  },
];

export default function GovernancePage() {
  const [selectedTab, setSelectedTab] = useState("proposals");

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="font-heading text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Governance Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Shape the future of Vortan through decentralized governance. Vote on
            proposals and participate in community decisions.
          </p>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 glass-effect">
            <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
            <TabsTrigger value="history">Voting History</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals" className="space-y-6">
            <div className="grid gap-6">
              {proposals
                .filter((p) => p.status === "active")
                .map((proposal) => (
                  <Card key={proposal.id} className="glass-effect glow-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-xl">
                            {proposal.title}
                          </CardTitle>
                          <CardDescription>
                            {proposal.description}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Proposed by {proposal.proposer}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {proposal.timeLeft} remaining
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-primary/20 text-primary"
                        >
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Voting Progress</span>
                          <span>
                            {proposal.totalVotes.toLocaleString()} /{" "}
                            {proposal.quorum.toLocaleString()} votes
                          </span>
                        </div>
                        <Progress
                          value={(proposal.totalVotes / proposal.quorum) * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-sm font-medium">
                              For: {proposal.votesFor.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={
                              (proposal.votesFor / proposal.totalVotes) * 100
                            }
                            className="h-1"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-sm font-medium">
                              Against: {proposal.votesAgainst.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={
                              (proposal.votesAgainst / proposal.totalVotes) *
                              100
                            }
                            className="h-1"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700">
                          <Vote className="h-4 w-4 mr-2" />
                          Vote For
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-400 text-red-400 hover:bg-red-400/10 bg-transparent"
                        >
                          <Vote className="h-4 w-4 mr-2" />
                          Vote Against
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-6">
              {proposals
                .filter((p) => p.status !== "active")
                .map((proposal) => (
                  <Card key={proposal.id} className="glass-effect glow-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-xl">
                            {proposal.title}
                          </CardTitle>
                          <CardDescription>
                            {proposal.description}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Proposed by {proposal.proposer}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            proposal.status === "passed"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            proposal.status === "passed"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }
                        >
                          {proposal.status === "passed" ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-sm font-medium">
                              For: {proposal.votesFor.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={
                              (proposal.votesFor / proposal.totalVotes) * 100
                            }
                            className="h-1"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-sm font-medium">
                              Against: {proposal.votesAgainst.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={
                              (proposal.votesAgainst / proposal.totalVotes) *
                              100
                            }
                            className="h-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

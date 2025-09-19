"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Loader2, FileText } from "lucide-react";
import { useGovernance } from "@/lib/web3/hooks/use-governance";
import { toast } from "react-toastify";

const proposalSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  targets: z
    .array(z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"))
    .min(1, "At least one target required"),
  values: z.array(z.string()).min(1, "At least one value required"),
  calldatas: z.array(z.string()).min(1, "At least one calldata required"),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface ProposalAction {
  target: string;
  value: string;
  calldata: string;
}

export function CreateProposalForm() {
  const [actions, setActions] = useState<ProposalAction[]>([
    { target: "", value: "0", calldata: "0x" },
  ]);

  const {
    userVotingPower,
    createProposal,
    isProposePending,
    votingDelay,
    votingPeriod,
  } = useGovernance();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      description: "",
      targets: [""],
      values: ["0"],
      calldatas: ["0x"],
    },
  });

  const description = watch("description");

  const addAction = () => {
    const newActions = [...actions, { target: "", value: "0", calldata: "0x" }];
    setActions(newActions);

    setValue(
      "targets",
      newActions.map((a) => a.target)
    );
    setValue(
      "values",
      newActions.map((a) => a.value)
    );
    setValue(
      "calldatas",
      newActions.map((a) => a.calldata)
    );
  };

  const removeAction = (index: number) => {
    if (actions.length === 1) {
      toast.error("At least one action is required");
      return;
    }

    const newActions = actions.filter((_, i) => i !== index);
    setActions(newActions);

    setValue(
      "targets",
      newActions.map((a) => a.target)
    );
    setValue(
      "values",
      newActions.map((a) => a.value)
    );
    setValue(
      "calldatas",
      newActions.map((a) => a.calldata)
    );
  };

  const updateAction = (
    index: number,
    field: keyof ProposalAction,
    value: string
  ) => {
    const newActions = actions.map((action, i) =>
      i === index ? { ...action, [field]: value } : action
    );
    setActions(newActions);

    setValue(
      "targets",
      newActions.map((a) => a.target)
    );
    setValue(
      "values",
      newActions.map((a) => a.value)
    );
    setValue(
      "calldatas",
      newActions.map((a) => a.calldata)
    );
  };

  const onSubmit = async (data: ProposalFormData) => {
    try {
      const proposalInput = {
        targets: data.targets,
        values: data.values.map((v) => parseEther(v)),
        calldatas: data.calldatas,
        description: data.description,
      };

      await createProposal(proposalInput);

      // Reset form
      setActions([{ target: "", value: "0", calldata: "0x" }]);
      setValue("description", "");
      setValue("targets", [""]);
      setValue("values", ["0"]);
      setValue("calldatas", ["0x"]);
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

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

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create New Proposal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voting Power Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Your Voting Power
            </Label>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {formatVotingPower(userVotingPower)} VORT
            </Badge>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Voting Delay
            </Label>
            <Badge variant="secondary" className="text-sm">
              {formatBlocks(votingDelay)}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Voting Period
            </Label>
            <Badge variant="secondary" className="text-sm">
              {formatBlocks(votingPeriod)}
            </Badge>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Proposal Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this proposal aims to achieve..."
              className="min-h-[120px]"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Proposal Actions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAction}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Action
              </Button>
            </div>

            <div className="space-y-4">
              {actions.map((action, index) => (
                <Card key={index} className="bg-muted/10 border-border/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Action {index + 1}</h4>
                      {actions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`target-${index}`}>
                          Target Address
                        </Label>
                        <Input
                          id={`target-${index}`}
                          placeholder="0x..."
                          value={action.target}
                          onChange={(e) =>
                            updateAction(index, "target", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`value-${index}`}>ETH Value</Label>
                        <Input
                          id={`value-${index}`}
                          placeholder="0"
                          value={action.value}
                          onChange={(e) =>
                            updateAction(index, "value", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`calldata-${index}`}>Calldata</Label>
                        <Input
                          id={`calldata-${index}`}
                          placeholder="0x..."
                          value={action.calldata}
                          onChange={(e) =>
                            updateAction(index, "calldata", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(errors.targets || errors.values || errors.calldatas) && (
              <p className="text-sm text-destructive">
                Please fill in all action fields correctly
              </p>
            )}
          </div>

          <Separator />

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isProposePending || !userVotingPower || userVotingPower === "0"
              }
              className="min-w-[140px]"
            >
              {isProposePending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Proposal"
              )}
            </Button>
          </div>

          {(!userVotingPower || userVotingPower === "0") && (
            <p className="text-sm text-muted-foreground text-center">
              You need voting power to create proposals. Stake VORT tokens to
              participate in governance.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

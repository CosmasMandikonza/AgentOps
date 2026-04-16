import { AgentDetailShell } from "@/components/AgentDetailShell";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  return <AgentDetailShell agentId={agentId} />;
}

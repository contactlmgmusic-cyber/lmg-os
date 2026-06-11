import CandidatureDetailClient from "@/components/CandidatureDetailClient";

export const dynamic = "force-dynamic";

export default async function CandidatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CandidatureDetailClient id={id} />;
}
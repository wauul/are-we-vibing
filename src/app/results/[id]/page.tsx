import ResultsClient from "@/components/results-client";
export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ResultsClient id={(await params).id} />;
}

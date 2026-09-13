import SessionClient from "@/components/session-client";
export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <SessionClient id={(await params).id} />;
}

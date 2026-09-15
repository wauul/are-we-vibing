import NativeLogin from "@/components/native-login";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <NativeLogin id={(await params).id} />; }

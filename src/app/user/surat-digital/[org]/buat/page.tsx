import { redirect } from "next/navigation";

export default async function SuratDigitalUserBuatPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  redirect(`/user/surat-digital/${org}`);
}

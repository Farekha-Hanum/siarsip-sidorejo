import ArsipView from "@/components/surat/ArsipView";

export default async function SuratDigitalUserPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  return <ArsipView org={org} />;
}

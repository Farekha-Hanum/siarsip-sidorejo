import ArsipView from "@/components/surat/ArsipView";

export default async function SuratDigitalAdminPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  return <ArsipView org={org} />;
}

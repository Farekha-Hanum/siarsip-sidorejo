import { Suspense } from "react";
import EditorView from "@/components/surat/EditorView";

export default async function SuratDigitalAdminBuatPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  return (
    <Suspense fallback={<div>Loading Editor...</div>}>
      <EditorView org={org} />
    </Suspense>
  );
}

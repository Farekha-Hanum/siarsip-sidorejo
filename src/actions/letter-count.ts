"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Gets the current count of letters for a specific org to determine the next sequence number.
 */
export async function getNextLetterSequence(org: string) {
  const supabase = await createClient();
  
  const { count, error } = await supabase
    .from("surat")
    .select("id", { count: "exact", head: true })
    .eq("kategori_dashboard", org);

  if (error) {
    console.error("Error fetching letter count:", error);
    return 1; // Default to 1 if error
  }

  return (count || 0) + 1;
}

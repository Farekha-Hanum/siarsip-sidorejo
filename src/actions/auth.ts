"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const identifier = ((formData.get("email") as string) || "").trim();
  const password = ((formData.get("password") as string) || "").trim();

  if (!identifier || !password) {
    return { error: "Email/username dan password wajib diisi." };
  }

  let emailToUse = identifier;

  // Jika input bukan format email (atau user memasukkan username), cari email di tabel profiles
  if (!identifier.includes("@")) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (serviceKey && supabaseUrl) {
      try {
        const { createClient: createAdminClient } = await import("@supabase/supabase-js");
        const adminSupabase = createAdminClient(supabaseUrl, serviceKey);
        const { data: profile } = await adminSupabase
          .from("profiles")
          .select("id")
          .ilike("username", identifier)
          .maybeSingle();

        if (profile?.id) {
          const { data: userData } = await adminSupabase.auth.admin.getUserById(profile.id);
          if (userData?.user?.email) {
            emailToUse = userData.user.email;
          }
        }
      } catch (e) {
        console.error("Username lookup error:", e);
      }
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToUse,
    password,
  });

  if (error) {
    // Pesan error dalam Bahasa Indonesia
    let message = "Terjadi kesalahan saat login.";
    if (error.message.includes("Invalid login credentials")) {
      message = "Email/username atau password salah.";
    } else if (error.message.includes("Email not confirmed")) {
      message = "Email belum dikonfirmasi. Silakan cek inbox Anda.";
    } else {
      message = "Error: " + error.message;
    }
    return { error: message };
  }

  // Cek role untuk redirect
  let role = "user";
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    
    if (profile?.role) {
      role = profile.role;
      // Sinkronisasikan role di user_metadata jika berbeda dengan tabel profiles
      if (data.user.user_metadata?.role !== role) {
        await supabase.auth.updateUser({
          data: { role: role }
        });
      }
    } else {
      // Jika profile belum ada di DB public, coba baca dari user_metadata
      role = data.user.user_metadata?.role || "user";
    }
  } catch (e) {
    role = data.user.user_metadata?.role || "user";
  }

  revalidatePath("/", "layout");
  
  const redirectUrl = role === "admin" ? "/admin" : "/user";
  return { success: true, redirectUrl };
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;
  const nama_lengkap = formData.get("nama_lengkap") as string;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Jika service key tersedia, buat user langsung terkonfirmasi (email_confirm: true)
  if (serviceKey && supabaseUrl) {
    try {
      const { createClient: createAdminClient } = await import("@supabase/supabase-js");
      const adminSupabase = createAdminClient(supabaseUrl, serviceKey);

      const { data: adminData, error: adminError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          nama_lengkap,
          role: "user",
        },
      });

      if (adminError) {
        if (adminError.message.includes("already registered") || adminError.message.includes("already been registered")) {
          return { error: "Email sudah terdaftar." };
        }
        return { error: "Gagal mendaftar: " + adminError.message };
      }

      if (adminData?.user) {
        await adminSupabase.from("profiles").upsert({
          id: adminData.user.id,
          username,
          nama_lengkap,
          role: "user",
          assigned_dashboard: "all",
        });
      }

      revalidatePath("/", "layout");
      return { success: "Pendaftaran berhasil! Akun Anda aktif dan dapat langsung digunakan untuk login." };
    } catch (e: any) {
      console.error("Admin signup fallback:", e);
    }
  }

  // Fallback standar
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        nama_lengkap,
        role: "user",
      },
    },
  });

  if (error) {
    let message = "Gagal mendaftarkan akun.";
    if (error.message.includes("already registered")) {
      message = "Email sudah terdaftar.";
    }
    return { error: message };
  }

  revalidatePath("/", "layout");
  return { success: "Pendaftaran berhasil! Silakan langsung login dengan email dan password Anda." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

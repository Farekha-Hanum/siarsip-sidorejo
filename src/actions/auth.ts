"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Pesan error dalam Bahasa Indonesia
    let message = "Terjadi kesalahan saat login.";
    if (error.message.includes("Invalid login credentials")) {
      message = "Email atau password salah.";
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
    
    if (profile) {
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
  
  // Redirect based on role
  if (role === "admin") {
    redirect("/admin");
  } else {
    redirect("/user");
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;
  const nama_lengkap = formData.get("nama_lengkap") as string;

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
  return { success: "Pendaftaran berhasil! Silakan cek email untuk konfirmasi atau langsung login jika konfirmasi dinonaktifkan." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

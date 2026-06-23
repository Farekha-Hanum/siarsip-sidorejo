import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const usersToCreate = [
  {
    email: "adminsimpelnu@gmail.com",
    password: "admin1234",
    metadata: {
      nama_lengkap: "Admin SIMPEL NU",
      role: "admin",
      username: "admin_simpel_nu"
    }
  },
  {
    email: "putri.melati@gmail.com",
    password: "putri1234",
    metadata: {
      nama_lengkap: "Putri Melati",
      role: "user",
      username: "putri_melati"
    }
  },
  {
    email: "ahmad.hanafi@gmail.com",
    password: "hanafi123",
    metadata: {
      nama_lengkap: "Ahmad Hanafi",
      role: "user",
      username: "ahmad_hanafi"
    }
  }
];

async function seedUsers() {
  console.log("Memulai penambahan akun ke Supabase Auth...\n");

  for (const user of usersToCreate) {
    console.log(`Mencoba membuat akun: ${user.email} ...`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Otomatis terkonfirmasi, tidak perlu klik email
      user_metadata: user.metadata
    });

    if (error) {
      if (error.message.includes("already registered")) {
        console.log(`[INFO] Akun ${user.email} sudah terdaftar.\n`);
      } else {
        console.error(`[ERROR] Gagal membuat ${user.email}:`, error.message, "\n");
      }
    } else {
      console.log(`[SUKSES] Akun ${user.email} berhasil dibuat dengan Role: ${user.metadata.role}\n`);
    }
  }
  console.log("Selesai!");
}

seedUsers();

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxbymwkadxzqckjufjbr.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4Ynltd2thZHh6cWNranVmamJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA3Mjc2NCwiZXhwIjoyMDkxNjQ4NzY0fQ.DI9IvQArhJmVZUj-54RUPBndTNib5p-BVAHIQnyMMCc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUsers() {
  const { data: users, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('Auth error:', authError)
  } else {
    console.log('--- Auth Users ---')
    users.users.forEach(u => {
      console.log(`Email: ${u.email}, Role Meta: ${u.user_metadata?.role}`)
    })
  }

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('email, role')
  
  if (profileError) {
    console.error('Profile error:', profileError)
  } else {
    console.log('\n--- Profiles Table ---')
    profiles.forEach(p => {
      console.log(`Email: ${p.email}, Role: ${p.role}`)
    })
  }
}

checkUsers()

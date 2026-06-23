import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxbymwkadxzqckjufjbr.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4Ynltd2thZHh6cWNranVmamJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA3Mjc2NCwiZXhwIjoyMDkxNjQ4NzY0fQ.DI9IvQArhJmVZUj-54RUPBndTNib5p-BVAHIQnyMMCc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRole() {
  const email = 'putri.melati@gmail.com'
  
  // 1. Get user ID
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users.users.find(u => u.email === email)
  
  if (!user) {
    console.error('User not found')
    return
  }

  console.log(`Fixing role for ${email} (ID: ${user.id})...`)

  // 2. Update auth metadata
  const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, role: 'user' }
  })

  if (authError) {
    console.error('Auth update error:', authError)
  } else {
    console.log('Auth metadata updated to "user"')
  }

  // 3. Update profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'user' })
    .eq('id', user.id)

  if (profileError) {
    console.error('Profile update error:', profileError)
  } else {
    console.log('Profiles table updated to "user"')
  }
}

fixRole()

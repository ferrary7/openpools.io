import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import ProfileCompletionBanner from '@/components/ui/ProfileCompletionBanner'

export default async function ProtectedLayout({ children }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get keyword profile
  const { data: keywordProfile } = await supabase
    .from('keyword_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <ProfileCompletionBanner profile={profile} keywordProfile={keywordProfile} />
      <main>{children}</main>
    </div>
  )
}

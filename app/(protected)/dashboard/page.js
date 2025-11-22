import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import KeywordDisplay from '@/components/onboarding/KeywordDisplay'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // Get recent matches count
  const { count: matchesCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get journal entries count
  const { count: journalsCount } = await supabase
    .from('journals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get active collaborations count
  const { count: collabsCount } = await supabase
    .from('collaborations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'accepted')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Your Skills, Your Vibe, Your Network - all in one place.
        </p>
      </div>

      {/* Antenna Feature Banner */}
      <Link href="/ask-antenna" className="block mb-8 group">
        <div className="relative overflow-hidden rounded-2xl bg-[#1E1E1E] p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-transparent to-primary-500/20 opacity-50" />

          {/* Floating keywords decoration */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-40">
            <span className="px-2 py-1 text-xs bg-primary-500/30 text-primary-300 rounded-full">React</span>
            <span className="px-2 py-1 text-xs bg-primary-500/30 text-primary-300 rounded-full hidden sm:inline">Python</span>
            <span className="px-2 py-1 text-xs bg-primary-500/30 text-primary-300 rounded-full hidden md:inline">AI</span>
          </div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Antenna Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  <span className="text-primary-400">A</span>ntenna
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  Find the perfect people using natural language. Just describe who you're looking for.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium group-hover:bg-primary-600 transition-colors shrink-0">
              Ask Antenna
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Signals</div>
          <div className="text-3xl font-bold text-primary-600">
            {keywordProfile?.total_keywords || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Matches Found</div>
          <div className="text-3xl font-bold text-primary-600">
            {matchesCount || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Collaborators</div>
          <div className="text-3xl font-bold text-primary-600">
            {collabsCount || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Journal Entries</div>
          <div className="text-3xl font-bold text-primary-600">
            {journalsCount || 0}
          </div>
        </div>
      </div>

      {/* Keyword Profile */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Signal Profile
          </h2>
          <Link href="/profile" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Edit Profile →
          </Link>
        </div>
        {keywordProfile?.keywords ? (
          <KeywordDisplay keywords={keywordProfile.keywords} />
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">
              You haven't created your keyword profile yet
            </p>
            <Link href="/onboarding" className="btn-primary">
              Complete Onboarding
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Find Matches
          </h3>
          <p className="text-gray-600 mb-4">
            Meet people who vibe with your skills and work style
          </p>
          <Link href="/matches" className="btn-primary">
            View Matches
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your Collaborators
          </h3>
          <p className="text-gray-600 mb-4">
            Connect and chat with your active collaborators - keep the momentum going
          </p>
          <Link href="/collaborators" className="btn-primary">
            View Collaborators
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Write Journal
          </h3>
          <p className="text-gray-600 mb-4">
            Drop your thoughts, wins, or ideas - let your profile evolve
          </p>
          <Link href="/journal" className="btn-primary">
            Create Entry
          </Link>
        </div>
      </div>
    </div>
  )
}

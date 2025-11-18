'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProfileCompletionBanner({ profile, keywordProfile }) {
  const [dismissed, setDismissed] = useState(true) // Start as true to prevent flash
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem('profile_completion_banner_dismissed') === 'true'
    setDismissed(isDismissed)
  }, [])

  // Check if profile is incomplete
  const isProfileIncomplete = !profile?.full_name ||
                               !profile?.bio ||
                               !profile?.job_title ||
                               !keywordProfile?.keywords ||
                               keywordProfile?.keywords?.length === 0

  const handleDismiss = () => {
    localStorage.setItem('profile_completion_banner_dismissed', 'true')
    setDismissed(true)
  }

  if (!mounted || dismissed || !isProfileIncomplete) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-primary-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">
                Complete your profile to get better matches!
              </p>
              <p className="text-primary-100 text-sm">
                Add your details and professional signals to connect with the right people
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="bg-white text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
            >
              Complete Profile
            </Link>
            <button
              onClick={handleDismiss}
              className="text-primary-100 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export default function AntennaIntro({ onStart }) {
  const [selectedIntent, setSelectedIntent] = useState(null)
  const [userInput, setUserInput] = useState('')

  const intents = [
    {
      id: 'hiring',
      label: 'Hiring',
      description: 'Find talent to join your team',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      description: 'Partner on projects together',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'mentorship',
      label: 'Mentorship',
      description: 'Learn from experienced people',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      )
    },
    {
      id: 'networking',
      label: 'Networking',
      description: 'Expand your professional circle',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    },
  ]

  const handleStart = () => {
    if (userInput.trim() && selectedIntent) {
      onStart({ intent: selectedIntent, input: userInput.trim() })
    }
  }

  const placeholders = {
    hiring: 'e.g., Someone studying MBA, knows sales and marketing, has expertise in Python',
    collaboration: 'e.g., Studies at LPU, working on ML projects, interested in startups',
    mentorship: 'e.g., Senior developer at a tech company, experienced in React and Node.js',
    networking: 'e.g., Based in Mumbai, interested in blockchain and web3',
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Header with gradient accent */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              <span className="text-primary-500">A</span>ntenna Search
            </h1>
            <p className="text-sm text-gray-500">Natural language people discovery</p>
          </div>
        </div>
      </div>

      {/* Intent Selection */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">1</span>
          <label className="text-sm font-semibold text-gray-900">
            What are you looking for?
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {intents.map((intent) => (
            <button
              key={intent.id}
              onClick={() => setSelectedIntent(intent.id)}
              className={`group p-4 rounded-xl border-2 transition-all text-left ${
                selectedIntent === intent.id
                  ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  selectedIntent === intent.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}>
                  {intent.icon}
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-900">{intent.label}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{intent.description}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      {selectedIntent && (
        <div className="animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">2</span>
            <label className="text-sm font-semibold text-gray-900">
              Describe who you're looking for
            </label>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative bg-white border-2 border-gray-200 rounded-xl p-1 focus-within:border-primary-500 focus-within:shadow-lg focus-within:shadow-primary-500/10 transition-all">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={placeholders[selectedIntent]}
                className="w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none resize-none"
                rows={4}
                autoFocus
              />

              {/* Character hint */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Tip: Be specific with skills, locations, companies, or technologies
                </p>
                <span className={`text-xs font-medium ${userInput.length > 10 ? 'text-green-500' : 'text-gray-400'}`}>
                  {userInput.length > 10 ? 'Good detail!' : `${userInput.length}/10+`}
                </span>
              </div>
            </div>
          </div>

          {/* Example suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Try:</span>
            {['Python developer', 'from Bangalore', 'ML experience', 'startup founder'].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setUserInput(prev => prev + (prev ? ', ' : '') + suggestion)}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleStart}
            disabled={!userInput.trim()}
            className={`mt-6 w-full py-4 px-6 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${
              userInput.trim()
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find matches
          </button>
        </div>
      )}

      {/* Empty state hint */}
      {!selectedIntent && (
        <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Select an option above to get started</p>
        </div>
      )}
    </div>
  )
}

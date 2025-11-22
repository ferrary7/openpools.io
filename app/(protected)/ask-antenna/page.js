'use client'

import { useState } from 'react'
import AntennaHero from '@/components/ask-antenna/AntennaHero'
import AntennaIntro from '@/components/ask-antenna/AntennaIntro'
import QuestionFlow from '@/components/ask-antenna/QuestionFlow'
import ResultsReveal from '@/components/ask-antenna/ResultsReveal'

export default function AskAntennaPage() {
  const [stage, setStage] = useState('hero')
  const [userInput, setUserInput] = useState(null)
  const [answers, setAnswers] = useState([])
  const [matches, setMatches] = useState([])
  const [sessionKey, setSessionKey] = useState(0)

  const handleHeroStart = () => {
    setStage('intro')
  }

  const handleStart = (input) => {
    setUserInput(input)
    setStage('questions')
    setAnswers([])
    setSessionKey(prev => prev + 1)
  }

  const handleComplete = (finalAnswers, topMatches) => {
    setAnswers(finalAnswers)
    setMatches(topMatches)
    setStage('results')
  }

  const handleRestart = () => {
    setStage('intro')
    setUserInput(null)
    setAnswers([])
    setMatches([])
  }

  // Hero page - full screen dark with floating keywords
  if (stage === 'hero') {
    return <AntennaHero onStart={handleHeroStart} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {stage === 'intro' && <AntennaIntro onStart={handleStart} />}
        {stage === 'questions' && userInput && (
          <QuestionFlow key={sessionKey} userInput={userInput} onComplete={handleComplete} />
        )}
        {stage === 'results' && (
          <ResultsReveal matches={matches} onRestart={handleRestart} />
        )}
      </div>
    </div>
  )
}

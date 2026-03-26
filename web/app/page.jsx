'use client'

import { useState } from 'react'
import WelcomeScreen from '../components/WelcomeScreen'
import ChatInterface from '../components/ChatInterface'
import Recommendations from '../components/Recommendations'
import { INITIAL_MESSAGE } from '../lib/prompts'

const STATES = {
  WELCOME: 'welcome',
  INTERVIEW: 'interview',
  RECOMMENDATIONS: 'recommendations',
}

export default function Page() {
  const [state, setState] = useState(STATES.WELCOME)
  const [userName, setUserName] = useState('')
  const [profileData, setProfileData] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [messages, setMessages] = useState([])

  function handleStart({ name, profileData }) {
    setUserName(name)
    setProfileData(profileData)
    setState(STATES.INTERVIEW)
  }

  function handleComplete(recs, msgs) {
    setRecommendations(recs)
    setMessages(msgs)
    setState(STATES.RECOMMENDATIONS)
  }

  function handleRestart() {
    setUserName('')
    setProfileData(null)
    setRecommendations([])
    setMessages([])
    setState(STATES.WELCOME)
  }

  if (state === STATES.WELCOME) {
    return <WelcomeScreen onStart={handleStart} />
  }

  if (state === STATES.INTERVIEW) {
    return (
      <ChatInterface
        name={userName}
        profileData={profileData}
        initialMessage={INITIAL_MESSAGE}
        onComplete={handleComplete}
      />
    )
  }

  if (state === STATES.RECOMMENDATIONS) {
    return (
      <Recommendations
        name={userName}
        recommendations={recommendations}
        messages={messages}
        onRestart={handleRestart}
      />
    )
  }

  return null
}

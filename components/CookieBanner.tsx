'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner(){
  const [show, setShow] = useState(false)
  const [locale, setLocale] = useState('fr')

  useEffect(()=>{
    const consent = localStorage.getItem('cookie-consent')
    if(!consent) setShow(true)
    // Detect locale from html lang or navigator
    const lang = document.documentElement.lang || navigator.language
    setLocale(lang.startsWith('en') ? 'en' : 'fr')
  },[])

  function acceptAll(){
    localStorage.setItem('cookie-consent', JSON.stringify({ essential: true, analytics: true, date: new Date().toISOString() }))
    setShow(false)
    // Init PostHog analytics
    // posthog.opt_in_capturing()
  }

  function refuseAnalytics(){
    localStorage.setItem('cookie-consent', JSON.stringify({ essential: true, analytics: false, date: new Date().toISOString() }))
    setShow(false)
    // posthog.opt_out_capturing()
  }

  if(!show) return null

  const isFr = locale === 'fr'

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 z-50 border-t border-slate-700">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1">
          <div className="font-bold text-sm">{isFr ? '🍪 Cookies & Confidentialité - Toutes familles du monde' : '🍪 Cookies & Privacy - All families worldwide'}</div>
          <div className="text-xs text-slate-300 mt-1">
            {isFr 
              ? 'Essentiels: session auth, langue FR/EN. Analytics anonymisés PostHog (sans données perso) pour améliorer FamilyOS. Pas de pub tierce. Conforme RGPD/NDPR. Santé N4 jamais trackée.'
              : 'Essential: auth session, language FR/EN. Anonymized PostHog analytics (no personal data) to improve FamilyOS. No third-party ads. GDPR/NDPR compliant. Health N4 never tracked.'}
            <a href="/privacy" className="underline ml-2">{isFr ? 'Politique confidentialité' : 'Privacy policy'}</a>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={refuseAnalytics} className="px-4 py-2 bg-slate-700 rounded-xl text-xs hover:bg-slate-600">
            {isFr ? 'Essentiels seulement' : 'Essential only'}
          </button>
          <button onClick={acceptAll} className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-700">
            {isFr ? 'Accepter tout' : 'Accept all'}
          </button>
        </div>
      </div>
    </div>
  )
}

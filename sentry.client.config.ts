import * as Sentry from '@sentry/nextjs'
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend(event){
    // Filtre N4/N3 sensibles - Jamais envoyer santé ou coffre-fort
    const sensitive = ['health', 'vault', 'blood_group', 'allergies', 'medication', 'passport', 'salary']
    const str = JSON.stringify(event).toLowerCase()
    if(sensitive.some(s=>str.includes(s))){
      event.extra = { filtered: 'N4/N3 sensitive data removed for RGPD/NDPR' }
      if(event.request) event.request.data = '[Filtered]'
    }
    return event
  }
})

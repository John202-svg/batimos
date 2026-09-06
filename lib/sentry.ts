// Monitoring erreurs & performances - Sentry (Module 3)
import * as Sentry from '@sentry/nextjs'

export function initSentry(){
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% des transactions pour perf monitoring
    environment: process.env.NODE_ENV,
    // Ne jamais envoyer données santé N4 ou docs coffre-fort
    beforeSend(event){
      // Filtre données sensibles
      if(event.request?.data){
        const data = JSON.stringify(event.request.data)
        if(data.includes('health') || data.includes('vault') || data.includes('blood_group')){
          // Anonymise
          event.request.data = '[Filtered N4 sensitive data]'
        }
      }
      return event
    },
    // Ignore erreurs bénignes
    ignoreErrors: ['ResizeObserver loop', 'NetworkError']
  })
}

// Pour mobile: mobile/lib/sentry.ts
// import * as Sentry from '@sentry/react-native'
// Sentry.init({ dsn: EXPO_PUBLIC_SENTRY_DSN, ... })

import * as Sentry from '@sentry/react-native'
export function initSentryMobile(){
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    beforeSend(event){
      const str = JSON.stringify(event).toLowerCase()
      if(['health','vault','blood_group'].some(s=>str.includes(s))){
        event.extra = { filtered: 'N4 sensitive' }
      }
      return event
    }
  })
}

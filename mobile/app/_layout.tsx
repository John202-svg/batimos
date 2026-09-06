import { Stack } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function RootLayout(){
  useEffect(()=>{
    // Demande permission push (Module 14 + 23)
    Notifications.requestPermissionsAsync()
  },[])
  return <Stack screenOptions={{ headerShown: false }} />
}

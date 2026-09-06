import { Tabs } from 'expo-router'
import { Text } from 'react-native'

export default function AppLayout(){
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#4f46e5' }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ()=><Text>🏠</Text> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendrier', tabBarIcon: ()=><Text>📅</Text> }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tâches', tabBarIcon: ()=><Text>✅</Text> }} />
      <Tabs.Screen name="health" options={{ title: 'Santé', tabBarIcon: ()=><Text>🏥</Text> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: ()=><Text>💬</Text> }} />
    </Tabs>
  )
}

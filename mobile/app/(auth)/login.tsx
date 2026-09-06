import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [mode,setMode]=useState<'login'|'signup'>('signup')

  async function handleAuth(){
    if(mode==='signup'){
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: email.split('@')[0] } } })
      if(!error) router.replace('/(app)/dashboard')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if(!error) router.replace('/(app)/dashboard')
    }
  }

  return (
    <View className="flex-1 bg-indigo-950 p-6 justify-center">
      <Text className="text-white text-3xl font-bold">FamilyOS</Text>
      <Text className="text-indigo-200 mt-2">OS Numérique Famille - Mobile</Text>
      <View className="bg-white rounded-[24px] p-6 mt-8">
        <TextInput placeholder="email@famille.com" value={email} onChangeText={setEmail} className="border rounded-xl px-4 py-3 mb-3" />
        <TextInput placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} className="border rounded-xl px-4 py-3 mb-4" />
        <TouchableOpacity onPress={handleAuth} className="bg-indigo-600 py-3 rounded-xl">
          <Text className="text-white text-center font-bold">{mode==='signup'?'Inscription + Trial 7j':'Connexion'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

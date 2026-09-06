import { View, Text, ScrollView } from 'react-native'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function HealthMobile(){
  const [profiles,setProfiles]=useState<any[]>([])
  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user!.id).single()
      const { data } = await supabase.from('health_profiles').select('*').eq('family_id', fm!.family_id)
      setProfiles(data||[])
    })()
  },[])
  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold mt-8">Santé N4 - Mobile</Text>
      <Text className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full mt-2 self-start border border-rose-200">Hautement sensible - RLS + audit</Text>
      <Text className="text-[11px] text-amber-700 bg-amber-50 p-3 rounded-xl mt-4 border border-amber-200">⚠️ Infos médicaments = organisation uniquement, pas avis médical</Text>
      
      <View className="bg-white rounded-[20px] border p-5 mt-6">
        <Text className="font-bold">Profils Santé (Accès: soi-même ou parent_admin)</Text>
        {profiles.map(p=>(
          <View key={p.id} className="mt-3 p-3 bg-slate-50 rounded-xl">
            <Text className="font-bold">{p.member_user_id}</Text>
            <Text className="text-xs">GS: {p.blood_group} • Allergies: {p.allergies?.join(',')}</Text>
          </View>
        ))}
      </View>

      <View className="bg-slate-900 rounded-[20px] p-5 mt-6">
        <Text className="text-white font-bold">Urgence accès rapide (Optimisé mobile)</Text>
        <Text className="text-slate-300 text-sm mt-2">Contact urgence, allergies critiques, assurance, groupe sanguin - Accessible en 2 taps mais RLS respectée</Text>
      </View>
    </ScrollView>
  )
}

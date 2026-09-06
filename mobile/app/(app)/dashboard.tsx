import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function Dashboard(){
  const [family,setFamily]=useState<any>(null)
  const [stats,setStats]=useState({ events:0, late:0, budget:1240 })

  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      const { data: fm } = await supabase.from('family_members').select('family_id, role, families(name)').eq('user_id', user!.id).single()
      setFamily(fm)
      const { count } = await supabase.from('tasks').select('*', {count:'exact', head:true}).eq('family_id', fm!.family_id).eq('status','late')
      setStats(s=>({...s, late: count||0}))
    })()
  },[])

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold mt-8">{family?.families?.name} • Dashboard</Text>
      <View className="flex-row gap-2 mt-2">
        <Text className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">TRIALING 6j</Text>
        <Text className="text-xs bg-slate-200 px-3 py-1 rounded-full">{family?.role}</Text>
      </View>

      <View className="flex-row flex-wrap gap-3 mt-6">
        <View className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] border"><Text className="text-xs text-slate-500">Événements aujourd'hui</Text><Text className="text-xl font-bold mt-1">{stats.events}</Text></View>
        <View className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] border"><Text className="text-xs text-slate-500">Tâches en retard</Text><Text className="text-xl font-bold text-red-600">{stats.late}</Text></View>
        <View className="bg-white rounded-2xl p-4 flex-1 min-w-[45%] border"><Text className="text-xs text-slate-500">Budget restant</Text><Text className="text-xl font-bold">${stats.budget}</Text></View>
        <View className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex-1 min-w-[45%]"><Text className="text-xs text-rose-700">Urgence Santé N4</Text><Text className="text-sm font-bold mt-1">Accès rapide</Text></View>
      </View>

      <View className="bg-white rounded-[20px] border p-5 mt-6">
        <Text className="font-bold">Timeline du jour (Intégré)</Text>
        <View className="mt-3 gap-2">
          <View className="flex-row justify-between p-3 bg-slate-50 rounded-xl"><Text>09:00 École</Text><Text className="text-xs bg-blue-100 px-2 py-1 rounded-full">École</Text></View>
          <View className="flex-row justify-between p-3 bg-rose-50 rounded-xl border border-rose-200"><Text>14:00 Dentiste Léa</Text><Text className="text-xs bg-rose-100 px-2 py-1 rounded-full">Santé N4</Text></View>
          <View className="flex-row justify-between p-3 bg-amber-50 rounded-xl"><Text>18:00 Courses</Text><Text className="text-xs bg-amber-100 px-2 py-1 rounded-full">Achats</Text></View>
        </View>
      </View>

      <View className="bg-slate-900 rounded-[20px] p-5 mt-6">
        <Text className="text-white font-bold">Urgence - Accès rapide mobile (Module 23)</Text>
        <Text className="text-slate-400 text-xs mt-2">Allergies: Arachides • GS: O+ • Assurance: AXA 12345 • RLS respectée même en urgence</Text>
        <TouchableOpacity className="bg-white mt-4 py-3 rounded-xl"><Text className="text-center font-bold">Voir infos urgence N4</Text></TouchableOpacity>
      </View>
    </ScrollView>
  )
}

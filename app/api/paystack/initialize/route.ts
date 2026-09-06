import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401})
  const { data: fm } = await supabase.from('family_members').select('family_id').eq('user_id', user.id).single()
  
  const body = await req.json()
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY!

  // Initialise transaction Paystack avec metadata family_id pour webhook idempotent
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${paystackSecret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      amount: 1000 * 100, // $10 en kobo
      metadata: { family_id: fm!.family_id, user_id: user.id, plan: 'premium_monthly' },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`
    })
  })
  const data = await res.json()
  return NextResponse.json(data)
}

import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.from('banks').select('*').order('id', { ascending: true })
    if (error) {
      console.error('Supabase banks GET error:', error)
      return NextResponse.json({ data: [] })
    }
    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('Unexpected banks GET error:', err)
    return NextResponse.json({ data: [] })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const name = (body.name || '').toString().trim()
    if (!name) return NextResponse.json({ success: false, message: 'โปรดระบุชื่อธนาคาร' }, { status: 400 })

    const { error } = await supabase.from('banks').insert([{ name }])
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })

    return NextResponse.json({ success: true, message: 'เพิ่มธนาคารแล้ว' })
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Unexpected error' }, { status: 500 })
  }
}

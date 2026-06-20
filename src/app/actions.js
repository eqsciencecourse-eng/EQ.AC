'use server'

import { supabase } from '@/utils/supabase'
import { revalidatePath } from 'next/cache'

export async function getLatestReceiptNumber() {
  try {
    const { data, error } = await supabase
      .from('invoice')
      .select('receive_id')
      .order('receive_id', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Fetch latest receipt error:', error)
      return null
    }

    if (data && data.length > 0) {
      return data[0].receive_id
    }
    return null
  } catch (err) {
    console.error('Unexpected error fetching latest receipt:', err)
    return null
  }
}

export async function submitInvoice(formData) {
  try {
    const receive_id = formData.get('receive_id')
    const cus_name = formData.get('cus_name')
    const class_name = formData.get('class')
    const date_start = formData.get('date_start')
    const date_end = formData.get('date_end')
    const amount = formData.get('amount')
    const bank = formData.get('bank')
    const payment_date = formData.get('payment_date')
    const payment_time = formData.get('payment_time')
    const image = formData.get('image')
    const discount_details = formData.get('discount_details')

    let targetFilePath = null

    if (image && image.size > 0) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload Error:', uploadError)
        return { success: false, message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์สลิป' }
      }
      
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName)
      targetFilePath = publicUrlData.publicUrl
    }

    const { data, error } = await supabase
      .from('invoice')
      .insert([
        {
          receive_id,
          cus_name,
          class: class_name,
          date_start,
          date_end,
          amount,
          bank,
          payment_date,
          payment_time,
          slip_path: targetFilePath,
          discount_details: discount_details || null
        }
      ])

    if (error) {
      console.error('Insert Error:', error)
      return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message }
    }

    revalidatePath('/dashboard')
    return { success: true, message: 'บันทึกข้อมูลแล้ว' }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { success: false, message: 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ' }
  }
}

export async function updateInvoice(formData) {
  try {
    const receive_id = formData.get('receive_id')
    const cus_name = formData.get('cus_name')
    const class_name = formData.get('class')
    const date_start = formData.get('date_start')
    const date_end = formData.get('date_end')
    const amount = formData.get('amount')
    const payment_date = formData.get('payment_date')
    const payment_time = formData.get('payment_time')
    const image = formData.get('image')
    const discount_details = formData.get('discount_details')

    const updates = {
      cus_name,
      class: class_name,
      date_start,
      date_end,
      amount,
      payment_date,
      payment_time,
      discount_details: discount_details || null
    }

    if (image && image.size > 0) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload Error:', uploadError)
        return { success: false, message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์สลิป' }
      }
      
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName)
      updates.slip_path = publicUrlData.publicUrl
    }

    const { data, error } = await supabase
      .from('invoice')
      .update(updates)
      .eq('receive_id', receive_id)
      .select()

    if (error) {
      console.error('Update Error:', error)
      return { success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล: ' + error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/invoice/${receive_id}`)
    
    if (data && data.length === 0) {
      return { success: false, message: 'บันทึกไม่สำเร็จ: ไม่พบใบเสร็จที่ตรงกับ ID (' + receive_id + ')' }
    }

    return { success: true, message: 'บันทึกการแก้ไขแล้ว' }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { success: false, message: 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ' }
  }
}

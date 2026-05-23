import { supabase } from '@/utils/supabase'
import ReportClient from './ReportClient'

export const revalidate = 0

export default async function ReportPage() {
  const { data: invoices, error } = await supabase.from('invoice').select('*')
  
  const totalAmount = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0

  const count = invoices?.length || 0
  const avgAmount = count > 0 ? totalAmount / count : 0

  return (
    <ReportClient 
      invoices={invoices || []} 
      totalAmount={totalAmount} 
      count={count} 
      avgAmount={avgAmount}
    />
  )
}


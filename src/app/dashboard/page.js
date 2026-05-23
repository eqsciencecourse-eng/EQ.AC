import { supabase } from '@/utils/supabase'
import DashboardClient from './DashboardClient'

export const revalidate = 0 // always fetch fresh data

export default async function DashboardPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const day = resolvedSearchParams?.day || ''
  const month = resolvedSearchParams?.month || ''
  const year = resolvedSearchParams?.year || ''

  let query = supabase.from('invoice').select('*')

  // Not doing complex date filtering on Supabase just yet, we can filter in JS if needed,
  // or use Supabase filter functions. Since it's a migration, let's fetch all and filter in JS 
  // or try to filter in DB if straightforward. But it's easier to fetch all for now and pass to client.
  // Actually, filtering in DB is better:
  
  const { data: invoices, error } = await query.order('receive_id', { ascending: false })

  if (error) {
    console.error("Fetch Error:", error)
  }

  // Filter in JS for simplicity since Supabase doesn't have simple DAY(), MONTH() extract functions in postgREST without views
  let filteredInvoices = invoices || []
  
  if (day || month || year) {
    filteredInvoices = filteredInvoices.filter(inv => {
      if (!inv.payment_date) return false
      const d = new Date(inv.payment_date)
      const matchesDay = day ? d.getDate().toString() === day : true
      const matchesMonth = month ? (d.getMonth() + 1).toString() === month : true
      const matchesYear = year ? d.getFullYear().toString() === year : true
      return matchesDay && matchesMonth && matchesYear
    })
  }

  return <DashboardClient initialInvoices={filteredInvoices} />
}

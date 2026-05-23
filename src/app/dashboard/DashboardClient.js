'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'

export default function DashboardClient({ initialInvoices }) {
  const router = useRouter()
  const [invoices, setInvoices] = useState(initialInvoices)
  
  // Modals state
  const [selectedImage, setSelectedImage] = useState(null)
  const [editInvoice, setEditInvoice] = useState(null)

  // Filter states
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const handleFilter = (e) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (day) query.set('day', day)
    if (month) query.set('month', month)
    if (year) query.set('year', year)
    router.push(`/dashboard?${query.toString()}`)
  }

  const handleSort = (key, type) => {
    // Simple client-side sorting logic
    const sorted = [...invoices].sort((a, b) => {
      if (type === 'num') return parseFloat(a[key]) - parseFloat(b[key])
      if (type === 'str') return a[key].localeCompare(b[key])
      if (type === 'date' || type === 'time') return new Date(a[key]) - new Date(b[key])
      return 0
    })
    setInvoices(sorted) // Doesn't toggle desc/asc for brevity, but you can expand this
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    const updates = {
      cus_name: formData.get('cus_name'),
      payment_date: formData.get('payment_date'),
      amount: formData.get('amount'),
      class: formData.get('class'),
      date_start: formData.get('date_start'),
      date_end: formData.get('date_end'),
      payment_time: formData.get('payment_time'),
    }

    const { error } = await supabase
      .from('invoice')
      .update(updates)
      .eq('receive_id', editInvoice.receive_id)

    if (!error) {
      alert('บันทึกการเปลี่ยนแปลงสำเร็จ')
      setEditInvoice(null)
      router.refresh() // re-fetch data
    } else {
      alert('Error updating: ' + error.message)
    }
  }

  const handleDelete = async (receive_id) => {
    if (confirm('คุณต้องการลบใบเสร็จนี้ใช่หรือไม่?')) {
      const { error } = await supabase
        .from('invoice')
        .delete()
        .eq('receive_id', receive_id)

      if (!error) {
        alert('ลบใบเสร็จสำเร็จ')
        setInvoices(invoices.filter(inv => inv.receive_id !== receive_id))
        router.refresh()
      } else {
        alert('เกิดข้อผิดพลาดในการลบ: ' + error.message)
      }
    }
  }


  return (
    <div className="container-wide mt-4">
      <div className="row">
        <div className="col-lg-12 text-center">
          <h2>ใบเสร็จนักเรียน</h2>
          <br />
          <form onSubmit={handleFilter}>
            <div className="form-row align-items-center justify-content-center">
              <div className="col-auto">
                <select className="form-control mb-2" value={day} onChange={e => setDay(e.target.value)}>
                  <option value="">เลือกวันที่ชำระเงิน</option>
                  {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
              </div>
              <div className="col-auto">
                <select className="form-control mb-2" value={month} onChange={e => setMonth(e.target.value)}>
                  <option value="">เลือกเดือนที่ชำระเงิน</option>
                  {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
              </div>
              <div className="col-auto">
                <select className="form-control mb-2" value={year} onChange={e => setYear(e.target.value)}>
                  <option value="">เลือกปี</option>
                  {[...Array(25)].map((_, i) => {
                    const y = new Date().getFullYear() - i;
                    return <option key={y} value={y}>{y}</option>
                  })}
                </select>
              </div>
              <div className="col-auto">
                <button type="submit" className="btn btn-primary mb-2">ตกลง</button>
              </div>
            </div>
          </form>

          <div className="table-responsive mt-4">
            <table className="table table-bordered table-hover bg-white" id="invoiceTable">
              <thead className="thead-dark">
                <tr>
                  <th className="sortable" onClick={() => handleSort('receive_id', 'num')}>ใบเสร็จนักเรียน</th>
                  <th className="sortable" onClick={() => handleSort('cus_name', 'str')}>ชื่อ-สกุล นักเรียน</th>
                  <th className="sortable" onClick={() => handleSort('payment_date', 'date')}>ชำระเงินวันที่</th>
                  <th className="sortable" onClick={() => handleSort('amount', 'num')}>จำนวนเงิน</th>
                  <th className="sortable" onClick={() => handleSort('class', 'str')}>คลาส</th>
                  <th className="sortable" onClick={() => handleSort('date_start', 'date')}>วันที่เริ่มเรียน</th>
                  <th className="sortable" onClick={() => handleSort('date_end', 'date')}>วันสิ้นสุด</th>
                  <th className="sortable" onClick={() => handleSort('payment_time', 'time')}>เวลา</th>
                  <th>สลิป</th>
                  <th>จัดการ</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? invoices.map(invoice => (
                  <tr key={invoice.receive_id}>
                    <td>{invoice.receive_id}</td>
                    <td>{invoice.cus_name}</td>
                    <td>{new Date(invoice.payment_date).toLocaleDateString('en-GB')}</td>
                    <td>{Number(invoice.amount).toFixed(2)}</td>
                    <td>{invoice.class}</td>
                    <td>{new Date(invoice.date_start).toLocaleDateString('en-GB')}</td>
                    <td>{new Date(invoice.date_end).toLocaleDateString('en-GB')}</td>
                    <td>{invoice.payment_time ? invoice.payment_time.substring(0, 5) : ''}</td>
                    <td>
                      <button type="button" className="btn btn-link" onClick={() => setSelectedImage(invoice.slip_path)}>ดูสลิป</button>
                    </td>
                    <td>
                      <button type="button" className="btn btn-info btn-sm mr-1" onClick={() => setEditInvoice(invoice)}>แก้ไข</button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(invoice.receive_id)}>ลบ</button>
                    </td>
                    <td>
                      <Link href={`/invoice/${invoice.receive_id}`} target="_blank" className="btn btn-success btn-sm mb-1"><i className="bi bi-file-earmark-pdf"></i> View PDF</Link>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="11" align="center">No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">สลิปการโอนเงิน</h5>
                <button type="button" className="close" onClick={() => setSelectedImage(null)}>&times;</button>
              </div>
              <div className="modal-body text-center">
                <img src={selectedImage} className="img-fluid" alt="Slip" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">แก้ไขข้อมูล</h5>
                <button type="button" className="close" onClick={() => setEditInvoice(null)}>&times;</button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body text-left">
                  <div className="form-group">
                    <label>ชื่อ-สกุล นักเรียน</label>
                    <input type="text" className="form-control" name="cus_name" defaultValue={editInvoice.cus_name} />
                  </div>
                  <div className="form-group">
                    <label>ชำระเงินวันที่</label>
                    <input type="date" className="form-control" name="payment_date" defaultValue={editInvoice.payment_date} />
                  </div>
                  <div className="form-group">
                    <label>จำนวน</label>
                    <input type="number" className="form-control" name="amount" defaultValue={editInvoice.amount} />
                  </div>
                  <div className="form-group">
                    <label>คลาส</label>
                    <input type="text" className="form-control" name="class" defaultValue={editInvoice.class} />
                  </div>
                  <div className="form-group">
                    <label>วันที่เริ่มเรียน</label>
                    <input type="date" className="form-control" name="date_start" defaultValue={editInvoice.date_start} />
                  </div>
                  <div className="form-group">
                    <label>วันสิ้นสุดชำระค่าเรียน</label>
                    <input type="date" className="form-control" name="date_end" defaultValue={editInvoice.date_end} />
                  </div>
                  <div className="form-group">
                    <label>เวลาชำระเงิน</label>
                    <input type="time" className="form-control" name="payment_time" defaultValue={editInvoice.payment_time} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditInvoice(null)}>ปิด</button>
                  <button type="submit" className="btn btn-primary">บันทึกการเปลี่ยนแปลง</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

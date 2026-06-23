'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { updateInvoice } from '../actions'

export default function DashboardClient({ initialInvoices }) {
  const router = useRouter()
  const [invoices, setInvoices] = useState(initialInvoices)

  useEffect(() => {
    setInvoices(initialInvoices)
  }, [initialInvoices])
  
  // Modals state
  const [selectedImage, setSelectedImage] = useState(null)
  const [editInvoice, setEditInvoice] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

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
    setIsUpdating(true)
    const formData = new FormData(e.target)
    
    const result = await updateInvoice(formData)

    if (result.success) {
      alert(result.message)
      
      const updatedInvoice = {
        ...editInvoice,
        cus_name: formData.get('cus_name'),
        payment_date: formData.get('payment_date'),
        amount: formData.get('amount'),
        class: formData.get('class'),
        date_start: formData.get('date_start'),
        date_end: formData.get('date_end'),
        payment_time: formData.get('payment_time'),
        discount_details: formData.get('discount_details')
      };
      setInvoices(invoices.map(inv => inv.receive_id === editInvoice.receive_id ? updatedInvoice : inv));

      setEditInvoice(null)
      router.refresh() // re-fetch data
    } else {
      alert(result.message)
    }
    setIsUpdating(false)
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
                <button type="submit" className="btn btn-primary btn-sm mb-2">ตกลง</button>
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
                      <button type="button" className="btn btn-outline-info btn-sm" onClick={() => setSelectedImage(invoice.slip_path)}>ดูสลิป</button>
                    </td>
                    <td>
                      <div className="btn-group-actions">
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setEditInvoice(invoice)}>แก้ไข</button>
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(invoice.receive_id)}>ลบ</button>
                      </div>
                    </td>
                    <td>
                      <Link href={`/invoice/${invoice.receive_id}`} target="_blank" className="btn btn-outline-success btn-sm"><i className="bi bi-file-earmark-pdf"></i> PDF</Link>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', position: 'fixed', zIndex: 1050, left: 0, top: 0, width: '100%', height: '100%' }} onClick={() => setSelectedImage(null)}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header" style={{ padding: '18px 25px' }}>
                <h5 className="modal-title">สลิปการโอนเงิน</h5>
                <button type="button" className="close" onClick={() => setSelectedImage(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer' }}>&times;</button>
              </div>
              <div className="modal-body text-center">
                <img src={selectedImage} className="img-fluid" alt="Slip" style={{ maxWidth: '100%', borderRadius: '10px' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setSelectedImage(null)}>ปิด</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', position: 'fixed', zIndex: 1050, left: 0, top: 0, width: '100%', height: '100%', overflowY: 'auto' }} onClick={() => setEditInvoice(null)}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable animate-fade-in" style={{ transition: 'transform 0.3s ease-out', margin: '30px auto', maxHeight: 'calc(100vh - 60px)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px', maxHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header bg-light" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', borderBottom: '2px solid #e2e8f0', padding: '20px 25px', flexShrink: 0 }}>
                <h5 className="modal-title" style={{ color: '#1a365d', fontWeight: 'bold' }}>
                  <i className="bi bi-pencil-square me-2" style={{ color: '#2b59c3' }}></i> แก้ไขข้อมูลใบเสร็จ <span className="text-secondary">#{editInvoice.receive_id}</span>
                </h5>
                <button type="button" className="close" onClick={() => setEditInvoice(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer' }}>&times;</button>
              </div>
              <form onSubmit={handleUpdate} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <input type="hidden" name="receive_id" value={editInvoice.receive_id} />
                <div className="modal-body text-left" style={{ backgroundColor: '#f8fafc', padding: '25px 30px', overflowY: 'auto', flex: '1 1 auto' }}>
                  
                  {/* Section 1: Course Info */}
                  <div className="bg-white p-4 rounded mb-4 border shadow-sm" style={{ borderColor: '#e2e8f0', borderLeft: '4px solid #2b59c3' }}>
                    <h6 className="mb-4" style={{ color: '#1a365d', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                      <i className="bi bi-person-lines-fill me-2" style={{ color: '#2b59c3' }}></i> ข้อมูลนักเรียนและหลักสูตร
                    </h6>
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label className="font-weight-bold text-secondary">ชื่อ-สกุล นักเรียน</label>
                        <input type="text" className="form-control" name="cus_name" defaultValue={editInvoice.cus_name} />
                      </div>
                      <div className="form-group col-md-6">
                        <label className="font-weight-bold text-secondary">คลาสเรียน</label>
                        <input type="text" className="form-control" name="class" defaultValue={editInvoice.class} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label className="font-weight-bold text-secondary">วันที่เริ่มเรียน</label>
                        <input type="date" className="form-control" name="date_start" defaultValue={editInvoice.date_start} />
                      </div>
                      <div className="form-group col-md-6">
                        <label className="font-weight-bold text-secondary">วันสิ้นสุดชำระค่าเรียน</label>
                        <input type="date" className="form-control" name="date_end" defaultValue={editInvoice.date_end} />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Payment Info */}
                  <div className="bg-white p-4 rounded mb-2 border shadow-sm" style={{ borderColor: '#e2e8f0', borderLeft: '4px solid #38a169' }}>
                    <h6 className="mb-4" style={{ color: '#1a365d', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                      <i className="bi bi-wallet2 me-2" style={{ color: '#38a169' }}></i> รายละเอียดการชำระเงิน
                    </h6>
                    <div className="form-row">
                      <div className="form-group col-md-4">
                        <label className="font-weight-bold text-secondary">จำนวนเงิน (บาท)</label>
                        <input type="number" className="form-control" name="amount" defaultValue={editInvoice.amount} />
                      </div>
                      <div className="form-group col-md-4">
                        <label className="font-weight-bold text-secondary">ชำระเงินวันที่</label>
                        <input type="date" className="form-control" name="payment_date" defaultValue={editInvoice.payment_date} />
                      </div>
                      <div className="form-group col-md-4">
                        <label className="font-weight-bold text-secondary">เวลาชำระเงิน</label>
                        <input type="time" className="form-control" name="payment_time" defaultValue={editInvoice.payment_time} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="font-weight-bold text-secondary">รายละเอียดส่วนลดหรือโปรโมชั่น</label>
                      <textarea className="form-control" name="discount_details" rows="2" defaultValue={editInvoice.discount_details}></textarea>
                    </div>
                    <div className="form-group mb-0">
                      <label className="font-weight-bold text-secondary">แนบรูปภาพสลิปโอนเงินใหม่ <small className="text-muted font-weight-normal">(ไม่บังคับ)</small></label>
                      <input type="file" className="form-control-file form-control" name="image" accept="image/*" />
                    </div>
                  </div>

                </div>
                <div className="modal-footer bg-white" style={{ borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', borderTop: '1px solid #e2e8f0', padding: '15px 25px', flexShrink: 0 }}>
                  <button type="button" className="btn btn-light" onClick={() => setEditInvoice(null)} disabled={isUpdating}>ยกเลิก</button>
                  <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                    {isUpdating ? <span><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>กำลังบันทึก...</span> : <span><i className="bi bi-save me-2"></i>บันทึกการเปลี่ยนแปลง</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

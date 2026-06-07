"use client"

import { useState, useEffect } from 'react'
import { submitInvoice, getLatestReceiptNumber } from './actions'

export default function Home() {
  const [message, setMessage] = useState(null)
  const [msgType, setMsgType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [programs, setPrograms] = useState([])
  const [banks, setBanks] = useState([])
  const [programInput, setProgramInput] = useState('')
  const [bankInput, setBankInput] = useState('')
  const [isAddingProgram, setIsAddingProgram] = useState(false)
  const [isAddingBank, setIsAddingBank] = useState(false)
  const [showProgramsPanel, setShowProgramsPanel] = useState(false)
  const [localDeletedPrograms, setLocalDeletedPrograms] = useState([])
  const [localProgramOverrides, setLocalProgramOverrides] = useState({})
  const [editingProgramId, setEditingProgramId] = useState(null)
  const [editingProgramName, setEditingProgramName] = useState('')

  const [latestReceipt, setLatestReceipt] = useState(null)

  const [formData, setFormData] = useState({
    receive_id: '',
    cus_name: '',
    class: '',
    date_start: '',
    date_end: '',
    amount: '',
    bank: '',
    payment_date: '',
    payment_time: '',
    discount_details: ''
  })

  useEffect(() => {
    async function load() {
      try {
        const latest = await getLatestReceiptNumber()
        if (latest) setLatestReceipt(latest)
      } catch (e) {
        console.error(e)
      }

      const draft = localStorage.getItem('invoice_draft')
      if (draft) {
        setFormData(JSON.parse(draft))
      } else {
        const now = new Date()
        const tzOffset = now.getTimezoneOffset() * 60000
        const localISOTime = new Date(now - tzOffset).toISOString().slice(0, -1)
        setFormData(prev => ({
          ...prev,
          payment_date: localISOTime.split('T')[0],
          payment_time: localISOTime.split('T')[1].slice(0, 5)
        }))
      }

      try {
        const p = await fetch('/api/programs').then(r => r.json())
        const localP = JSON.parse(localStorage.getItem('localPrograms') || '[]')
        const localDeleted = JSON.parse(localStorage.getItem('localDeletedPrograms') || '[]')
        const overrides = JSON.parse(localStorage.getItem('localProgramOverrides') || '{}')
        // mark local entries
        const localMarked = localP.map(x => ({ ...x, __source: 'local' }))
        const server = (p.data || []).filter(sp => !localDeleted.includes(sp.id)).map(sp => ({ ...sp, name: overrides[sp.id] || sp.name, __source: 'server' }))
        setPrograms([...server, ...localMarked])
        setLocalDeletedPrograms(localDeleted)
        setLocalProgramOverrides(overrides)
      } catch (e) {
        console.error(e)
      }
      try {
        const b = await fetch('/api/banks').then(r => r.json())
        const localB = JSON.parse(localStorage.getItem('localBanks') || '[]')
        setBanks([...(b.data || []), ...localB])
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = { ...formData, [name]: value }
    setFormData(updated)
    localStorage.setItem('invoice_draft', JSON.stringify(updated))
  }

  const setNow = () => {
    const now = new Date()
    const tzOffset = now.getTimezoneOffset() * 60000
    const localISOTime = new Date(now - tzOffset).toISOString().slice(0, -1)
    const updated = {
      ...formData,
      payment_date: localISOTime.split('T')[0],
      payment_time: localISOTime.split('T')[1].slice(0, 5)
    }
    setFormData(updated)
    localStorage.setItem('invoice_draft', JSON.stringify(updated))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    const fd = new FormData(e.target)
    const result = await submitInvoice(fd)

    setMessage(result.message)
    setMsgType(result.success ? 'success' : 'danger')

    if (result.success) {
      e.target.reset()
      const now = new Date()
      const tzOffset = now.getTimezoneOffset() * 60000
      const localISOTime = new Date(now - tzOffset).toISOString().slice(0, -1)
      setFormData({
        receive_id: '',
        cus_name: '',
        class: '',
        date_start: '',
        date_end: '',
        amount: '',
        bank: '',
        payment_date: localISOTime.split('T')[0],
        payment_time: localISOTime.split('T')[1].slice(0, 5),
        discount_details: ''
      })
      localStorage.removeItem('invoice_draft')
      
      const latest = await getLatestReceiptNumber()
      if (latest) setLatestReceipt(latest)
      
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setIsSubmitting(false)
  }

  async function handleAddProgram(e) {
    if (e && e.preventDefault) e.preventDefault()
    const name = programInput.trim()
    if (!name) return setMessage('โปรดกรอกชื่อวิชา')
    setIsAddingProgram(true)
    try {
      const existingNames = programs.map(x => x.name || x)
      if (existingNames.includes(name)) {
        setMessage('ชื่อวิชานี้มีอยู่แล้ว')
        setMsgType('danger')
        setIsAddingProgram(false)
        return
      }
      const newEntry = { id: Date.now(), name, __source: 'local' }
      const newPrograms = [...programs, newEntry]
      setPrograms(newPrograms)
      const localSaved = JSON.parse(localStorage.getItem('localPrograms') || '[]')
      localStorage.setItem('localPrograms', JSON.stringify([...localSaved, newEntry]))
      setMessage('เพิ่มรายวิชาแล้ว')
      setMsgType('success')
      setProgramInput('')
    } catch (err) {
      console.error(err)
      setMessage('เกิดข้อผิดพลาด')
      setMsgType('danger')
    }
    setIsAddingProgram(false)
  }

  async function handleAddBank(e) {
    if (e && e.preventDefault) e.preventDefault()
    const name = bankInput.trim()
    if (!name) return setMessage('โปรดกรอกชื่อธนาคาร')
    setIsAddingBank(true)
    try {
      const existingNames = banks.map(x => x.name || x)
      if (existingNames.includes(name)) {
        setMessage('ชื่อธนาคารนี้มีอยู่แล้ว')
        setMsgType('danger')
        setIsAddingBank(false)
        return
      }
      const newEntry = { id: Date.now(), name, __source: 'local' }
      const newBanks = [...banks, newEntry]
      setBanks(newBanks)
      const localSaved = JSON.parse(localStorage.getItem('localBanks') || '[]')
      localStorage.setItem('localBanks', JSON.stringify([...localSaved, newEntry]))
      setMessage('เพิ่มธนาคารแล้ว')
      setMsgType('success')
      setBankInput('')
    } catch (err) {
      console.error(err)
      setMessage('เกิดข้อผิดพลาด')
      setMsgType('danger')
    }
    setIsAddingBank(false)
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px', marginTop: '40px', marginBottom: '60px' }}>
      <div className="card shadow-sm border-0 hover-card-effect" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body p-4 p-md-5 bg-white">
          <h2 className="text-center mb-4" style={{ color: '#1a365d', fontWeight: 'bold' }}>ระบบบันทึกการชำระเงิน</h2>

          {message && (
            <div className={`alert alert-${msgType === 'danger' ? 'danger' : 'success'} text-center shadow-sm rounded mb-4`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data">

            {/* Section 1: Course Info */}
            <div className="bg-white p-4 p-md-5 rounded mb-4 border shadow-sm hover-card-effect animate-fade-in animate-delay-1" style={{ borderColor: '#e2e8f0', borderLeft: '5px solid #2b59c3' }}>
              <h5 className="mb-4" style={{ color: '#1a365d', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="bi bi-person-lines-fill me-2" style={{ color: '#2b59c3' }}></i> ข้อมูลนักเรียนและหลักสูตร
              </h5>

              <div className="form-row">
                <div className="form-group col-md-4">
                  <label htmlFor="receive_id" className="font-weight-bold">หมายเลขใบเสร็จ</label>
                  <input type="number" className="form-control" name="receive_id" min="1" required placeholder={latestReceipt ? `หมายเลขใบเสร็จล่าสุดคือ ${latestReceipt}` : "กำลังโหลดเลขล่าสุด..."} value={formData.receive_id} onChange={handleChange} />
                  {latestReceipt && (
                    <div className="mt-2 animate-pulse-subtle">
                      <span className="badge badge-info py-2 px-3" style={{ backgroundColor: 'rgba(49, 130, 206, 0.1)', color: '#2b6cb0', border: '1px solid rgba(49, 130, 206, 0.2)', fontSize: '0.85rem', fontWeight: '500', borderRadius: '8px' }}>
                        <i className="bi bi-info-circle-fill me-1"></i> เลขใบเสร็จล่าสุดคือ: <strong style={{ fontSize: '0.95rem' }}>{latestReceipt}</strong>
                      </span>
                    </div>
                  )}
                </div>
                <div className="form-group col-md-8">
                  <label htmlFor="cus_name" className="font-weight-bold">ชื่อ-สกุล นักเรียน</label>
                  <input type="text" className="form-control" name="cus_name" required placeholder="นาย/นางสาว/เด็กชาย/เด็กหญิง" value={formData.cus_name} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="class" className="font-weight-bold">เลือกโปรแกรมวิชา</label>
                <div className="d-flex flex-wrap flex-md-nowrap gap-2 align-items-start">
                  <select name="class" className="form-control" required value={formData.class} onChange={handleChange}>
                    <option value="">- เลือกโปรแกรมวิชา -</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <div className="d-flex w-100 mt-2 mt-md-0" style={{ gap: '8px' }}>
                    <input value={programInput} onChange={e => setProgramInput(e.target.value)} className="form-control" placeholder="เพิ่มวิชาใหม่" />
                    <button className="btn btn-outline-primary text-nowrap" type="button" onClick={handleAddProgram} disabled={isAddingProgram}>
                      {isAddingProgram ? 'กำลังเพิ่ม...' : 'เพิ่ม'}
                    </button>
                  </div>
                  <button className="btn btn-link text-nowrap mt-2 mt-md-0" type="button" onClick={() => setShowProgramsPanel(s => !s)}>
                    {showProgramsPanel ? 'ปิดรายการ' : 'ดูรายวิชาทั้งหมด'}
                  </button>
                </div>
              </div>

              {showProgramsPanel && (
                <div className="card mb-3 shadow-sm">
                  <div className="card-body p-3">
                    <h6 className="mb-3 font-weight-bold text-secondary">รายการโปรแกรมวิชา</h6>
                    <div style={{ maxHeight: '240px', overflow: 'auto' }}>
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>ชื่อวิชา</th>
                            <th style={{ width: '140px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {programs.map(p => (
                            <tr key={p.id}>
                              <td>
                                {editingProgramId === p.id ? (
                                  <input className="form-control" value={editingProgramName} onChange={e => setEditingProgramName(e.target.value)} />
                                ) : (
                                  <>
                                    <strong>{p.name}</strong>
                                    <small className="text-muted" style={{ marginLeft: '8px' }}>{p.__source === 'local' ? ' (Local)' : ' (Server)'}</small>
                                  </>
                                )}
                              </td>
                              <td>
                                {editingProgramId === p.id ? (
                                  <>
                                    <button className="btn btn-sm btn-primary mr-2" onClick={() => {
                                      const newName = editingProgramName.trim()
                                      if (!newName) return setMessage('โปรดกรอกชื่อ')
                                      if (p.__source === 'local') {
                                        const saved = JSON.parse(localStorage.getItem('localPrograms') || '[]')
                                        const updated = saved.map(x => x.id === p.id ? { ...x, name: newName } : x)
                                        localStorage.setItem('localPrograms', JSON.stringify(updated))
                                        setPrograms(prs => prs.map(x => x.id === p.id ? { ...x, name: newName } : x))
                                      } else {
                                        const overrides = JSON.parse(localStorage.getItem('localProgramOverrides') || '{}')
                                        overrides[p.id] = newName
                                        localStorage.setItem('localProgramOverrides', JSON.stringify(overrides))
                                        setLocalProgramOverrides(overrides)
                                        setPrograms(prs => prs.map(x => x.id === p.id ? { ...x, name: newName } : x))
                                      }
                                      setEditingProgramId(null)
                                      setEditingProgramName('')
                                    }}>บันทึก</button>
                                    <button className="btn btn-sm btn-secondary" onClick={() => { setEditingProgramId(null); setEditingProgramName('') }}>ยกเลิก</button>
                                  </>
                                ) : (
                                  <>
                                    <button className="btn btn-sm btn-outline-secondary mr-2" onClick={() => { setEditingProgramId(p.id); setEditingProgramName(p.name) }}>แก้ไข</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => {
                                      if (p.__source === 'local') {
                                        const saved = JSON.parse(localStorage.getItem('localPrograms') || '[]')
                                        const updated = saved.filter(x => x.id !== p.id)
                                        localStorage.setItem('localPrograms', JSON.stringify(updated))
                                        setPrograms(prs => prs.filter(x => x.id !== p.id))
                                      } else {
                                        const deleted = JSON.parse(localStorage.getItem('localDeletedPrograms') || '[]')
                                        if (!deleted.includes(p.id)) deleted.push(p.id)
                                        localStorage.setItem('localDeletedPrograms', JSON.stringify(deleted))
                                        setLocalDeletedPrograms(deleted)
                                        setPrograms(prs => prs.filter(x => x.id !== p.id))
                                      }
                                    }}>ลบ</button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="date_start" className="font-weight-bold">วันที่เริ่มเรียน</label>
                  <input type="date" className="form-control" name="date_start" required value={formData.date_start} onChange={handleChange} />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="date_end" className="font-weight-bold">วันสิ้นสุดชำระค่าเรียน</label>
                  <input type="date" className="form-control" name="date_end" required value={formData.date_end} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 2: Payment Info */}
            <div className="bg-white p-4 p-md-5 rounded mb-4 border shadow-sm hover-card-effect animate-fade-in animate-delay-2" style={{ borderColor: '#e2e8f0', borderLeft: '5px solid #38a169' }}>
              <h5 className="mb-4" style={{ color: '#1a365d', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="bi bi-wallet2 me-2" style={{ color: '#38a169' }}></i> รายละเอียดการชำระเงิน
              </h5>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="amount" className="font-weight-bold">จำนวนเงินที่ชำระ (บาท)</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text bg-white">฿</span>
                    </div>
                    <input type="number" className="form-control" name="amount" min="0" required placeholder="0.00" value={formData.amount} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="bank" className="font-weight-bold">เลือกธนาคาร</label>
                  <div className="d-flex flex-wrap flex-md-nowrap gap-2 align-items-start">
                    <select name="bank" className="form-control" required value={formData.bank} onChange={handleChange}>
                      <option value="">เลือกธนาคาร</option>
                      {banks.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                    <div className="d-flex w-100 mt-2 mt-md-0" style={{ gap: '8px' }}>
                      <input value={bankInput} onChange={e => setBankInput(e.target.value)} className="form-control" placeholder="เพิ่มธนาคารใหม่" />
                      <button className="btn btn-outline-primary text-nowrap" type="button" onClick={handleAddBank} disabled={isAddingBank}>
                        {isAddingBank ? 'กำลังเพิ่ม...' : 'เพิ่ม'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="payment_date" className="font-weight-bold">วันที่ชำระเงิน</label>
                  <input type="date" className="form-control" name="payment_date" required value={formData.payment_date} onChange={handleChange} />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="payment_time" className="font-weight-bold">เวลาที่ชำระเงิน</label>
                  <div className="input-group">
                    <input type="time" className="form-control" name="payment_time" required value={formData.payment_time} onChange={handleChange} />
                    <div className="input-group-append">
                      <button className="btn btn-outline-secondary" type="button" onClick={setNow}>
                        <i className="bi bi-clock-history mr-1"></i> เวลาปัจจุบัน
                      </button>
                    </div>
                  </div>
                  <small className="form-text text-muted">สามารถพิมพ์หรือเลือกเวลาย้อนหลังได้</small>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="discount_details" className="font-weight-bold">รายละเอียดส่วนลดหรือโปรโมชั่น (ถ้ามี)</label>
                <textarea className="form-control" name="discount_details" id="discount_details" rows="2" placeholder="ระบุรายละเอียดส่วนลด หรือโปรโมชั่นต่างๆ เช่น ส่วนลดพี่น้อง 10%, โปรโมชั่นประจำเดือน" value={formData.discount_details} onChange={handleChange}></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="image" className="font-weight-bold">แนบรูปภาพสลิปโอนเงิน <small className="text-muted font-weight-normal">(ไม่บังคับ)</small></label>
                <input type="file" className="form-control-file form-control" name="image" id="image" accept="image/*" />
              </div>
            </div>

            <div className="form-group mt-4 mb-0 animate-fade-in animate-delay-3">
              <button type="submit" className="btn btn-primary btn-block py-3 shadow-sm rounded" style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '0.5px' }} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>กำลังบันทึกข้อมูล...</span>
                ) : (
                  <><i className="bi bi-save me-2"></i> บันทึกข้อมูลใบเสร็จ</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

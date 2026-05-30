"use client"

import { useState, useEffect } from 'react'
import { submitInvoice } from './actions'

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

  useEffect(() => {
    async function load() {
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

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.target)
    const result = await submitInvoice(formData)

    setMessage(result.message)
    setMsgType(result.success ? 'success' : 'danger')

    if (result.success) {
      e.target.reset()
    }
    setIsSubmitting(false)
  }

  async function handleAddProgram(e) {
    if (e && e.preventDefault) e.preventDefault()
    const name = programInput.trim()
    if (!name) return setMessage('โปรดกรอกชื่อวิชา')
    setIsAddingProgram(true)
    try {
      // Add program locally (don't write to DB) and persist in localStorage
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
      // Add bank locally (don't write to DB) and persist in localStorage
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
    <div className="container" style={{ maxWidth: '750px', marginTop: '40px' }}>
      <h2 className="text-center mb-4" style={{ color: '#1a365d', fontWeight: 'bold' }}>ระบบบันทึกการชำระเงิน</h2>

      {message && (
        <div className={`alert alert-${msgType === 'danger' ? 'danger' : 'success'} text-center shadow-sm`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">

        {/* Section 1: Course Info */}
        <h5 className="mb-3" style={{ color: '#2b59c3', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          <i className="bi bi-person-fill"></i> ข้อมูลนักเรียนและหลักสูตร
        </h5>

        <div className="form-row">
          <div className="form-group col-md-4">
            <label htmlFor="receive_id">หมายเลขใบเสร็จ</label>
            <input type="number" className="form-control" name="receive_id" min="1" required placeholder="เช่น 9999" />
          </div>
          <div className="form-group col-md-8">
            <label htmlFor="cus_name">ชื่อ-สกุล นักเรียน</label>
            <input type="text" className="form-control" name="cus_name" required placeholder="นาย/นางสาว/เด็กชาย/เด็กหญิง" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="class">เลือกโปรแกรมวิชา</label>
          <div className="d-flex gap-2 align-items-start">
            <select name="class" className="form-control" required>
              <option value="">- เลือกโปรแกรมวิชา -</option>
              {programs.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <div className="d-flex" style={{ gap: '8px' }}>
              <input value={programInput} onChange={e => setProgramInput(e.target.value)} className="form-control" placeholder="เพิ่มวิชาใหม่" />
              <button className="btn btn-outline-primary" type="button" onClick={handleAddProgram} disabled={isAddingProgram}>{isAddingProgram ? 'กำลังเพิ่ม...' : 'เพิ่ม'}</button>
            </div>
            <button className="btn btn-link" type="button" onClick={() => setShowProgramsPanel(s => !s)} style={{ marginLeft: '8px' }}>{showProgramsPanel ? 'ปิดรายการ' : 'ดูรายวิชาทั้งหมด'}</button>
          </div>
        </div>

        {showProgramsPanel && (
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="mb-3">รายการโปรแกรมวิชา</h6>
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
                                // apply edit
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
                                // delete behavior
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
            <label htmlFor="date_start">วันที่เริ่มเรียน</label>
            <input type="date" className="form-control" name="date_start" required />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="date_end">วันสิ้นสุดชำระค่าเรียน</label>
            <input type="date" className="form-control" name="date_end" required />
          </div>
        </div>

        {/* Section 2: Payment Info */}
        <h5 className="mb-3 mt-4" style={{ color: '#2b59c3', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          <i className="bi bi-wallet2"></i> รายละเอียดการชำระเงิน
        </h5>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="amount">จำนวนเงินที่ชำระ (บาท)</label>
            <input type="number" className="form-control" name="amount" min="0" required placeholder="0.00" />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="bank">เลือกธนาคาร</label>
            <div className="d-flex gap-2 align-items-start">
              <select name="bank" className="form-control" required>
                <option value="">เลือกธนาคาร</option>
                {banks.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
              <div className="d-flex" style={{ gap: '8px' }}>
                <input value={bankInput} onChange={e => setBankInput(e.target.value)} className="form-control" placeholder="เพิ่มธนาคารใหม่" />
                <button className="btn btn-outline-primary" type="button" onClick={handleAddBank} disabled={isAddingBank}>{isAddingBank ? 'กำลังเพิ่ม...' : 'เพิ่ม'}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="payment_date">วันที่ชำระเงิน</label>
            <input type="date" className="form-control" name="payment_date" required />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="payment_time">เวลาที่ชำระเงิน</label>
            <input type="time" className="form-control" name="payment_time" required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="discount_details">รายละเอียดส่วนลดหรือโปรโมชั่น (ถ้ามี)</label>
          <textarea className="form-control" name="discount_details" id="discount_details" rows="2" placeholder="ระบุรายละเอียดส่วนลด หรือโปรโมชั่นต่างๆ เช่น ส่วนลดพี่น้อง 10%, โปรโมชั่นประจำเดือน"></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="image">แนบรูปภาพสลิปโอนเงิน <small className="text-muted">(ไม่บังคับ)</small></label>
          <input type="file" className="form-control-file form-control" name="image" id="image" accept="image/*" />
        </div>

        <div className="form-group mt-4 mb-0">
          <button type="submit" className="btn btn-primary btn-block py-3" style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '0.5px' }} disabled={isSubmitting}>
            {isSubmitting ? (
              <span><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>กำลังบันทึกข้อมูล...</span>
            ) : (
              'บันทึกข้อมูลใบเสร็จ'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}


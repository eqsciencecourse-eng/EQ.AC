'use client'

import { useState } from 'react'

export default function ReportClient({ invoices, totalAmount, count, avgAmount }) {
  const [selectedSlip, setSelectedSlip] = useState(null)

  return (
    <>
      <div className="container-wide mt-4" style={{ padding: '30px 40px' }}>
        <h2 className="text-center mb-4" style={{ color: '#1a365d', fontWeight: 'bold' }}>รายงานสรุปยอดชำระเงิน</h2>
        
        {/* Stats Grid */}
        <div className="row mb-5">
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 text-white" style={{ background: 'linear-gradient(135deg, #1e3d9c, #2b59c3)', borderRadius: '12px' }}>
              <div className="card-body p-4 text-center">
                <h6 className="text-uppercase mb-2" style={{ letterSpacing: '1px', opacity: 0.85, fontSize: '0.85rem' }}>ยอดรวมทั้งหมด</h6>
                <h3 className="mb-0 font-weight-bold" style={{ fontSize: '1.8rem' }}>
                  {totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>บาท</span>
                </h3>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px' }}>
              <div className="card-body p-4 text-center">
                <h6 className="text-uppercase mb-2" style={{ letterSpacing: '1px', opacity: 0.85, fontSize: '0.85rem' }}>ใบเสร็จทั้งหมด</h6>
                <h3 className="mb-0 font-weight-bold" style={{ fontSize: '1.8rem' }}>
                  {count.toLocaleString('th-TH')} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>รายการ</span>
                </h3>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 text-dark" style={{ background: '#eef4f8', border: '1px solid #cce2f3', borderRadius: '12px' }}>
              <div className="card-body p-4 text-center">
                <h6 className="text-uppercase mb-2 text-muted" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>ยอดเฉลี่ยต่อใบเสร็จ</h6>
                <h3 className="mb-0 font-weight-bold" style={{ fontSize: '1.8rem', color: '#1a365d' }}>
                  {avgAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>บาท</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-hover bg-white mb-0">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: '12%' }}>วันที่ชำระ</th>
                <th>ชื่อนักเรียน</th>
                <th>คลาสเรียน</th>
                <th style={{ width: '15%' }}>ช่องทางชำระเงิน</th>
                <th style={{ width: '15%' }} className="text-right">จำนวนเงิน (บาท)</th>
                <th style={{ width: '10%' }} className="text-center">หลักฐาน</th>
              </tr>
            </thead>
            <tbody>
              {count > 0 ? invoices.map(inv => (
                <tr key={inv.receive_id}>
                  <td>{new Date(inv.payment_date).toLocaleDateString('th-TH')}</td>
                  <td className="text-left font-weight-bold">{inv.cus_name}</td>
                  <td className="text-left">{inv.class}</td>
                  <td><span className="badge badge-light px-3 py-2" style={{ fontSize: '0.9rem', borderRadius: '20px' }}>{inv.bank}</span></td>
                  <td align="right" className="font-weight-bold" style={{ color: '#2b59c3' }}>
                    {Number(inv.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center">
                    {inv.slip_path ? (
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedSlip(inv)}
                        title="ดูหลักฐานการโอนเงิน"
                      >
                        <i className="bi bi-image"></i> ดู
                      </button>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>-</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" align="center" className="text-muted py-4">ไม่มีข้อมูลใบเสร็จรับเงินในระบบ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <div 
          className="modal" 
          style={{ display: 'block', position: 'fixed', zIndex: 1050, left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedSlip(null)}
        >
          <div 
            className="modal-dialog modal-lg"
            style={{ margin: 'auto', marginTop: '50px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">หลักฐานการโอนเงิน</h5>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => setSelectedSlip(null)}
                  style={{ cursor: 'pointer', fontSize: '1.5rem', border: 'none', background: 'none' }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body" style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '10px', color: '#666' }}>
                  <strong>ชื่อนักเรียน:</strong> {selectedSlip.cus_name}
                </p>
                <p style={{ marginBottom: '10px', color: '#666' }}>
                  <strong>จำนวนเงิน:</strong> {Number(selectedSlip.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                </p>
                <p style={{ marginBottom: '15px', color: '#666' }}>
                  <strong>วันที่ชำระ:</strong> {new Date(selectedSlip.payment_date).toLocaleDateString('th-TH')}
                </p>
                <img 
                  src={selectedSlip.slip_path} 
                  alt="Slip" 
                  style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px', border: '1px solid #ddd' }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="18" fill="%23999" text-anchor="middle" dy=".3em"%3EUnable to load image%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
              <div className="modal-footer">
                <a 
                  href={selectedSlip.slip_path} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                  download
                >
                  ดาวน์โหลด
                </a>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedSlip(null)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

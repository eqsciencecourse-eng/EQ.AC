'use client'

import { useState, useMemo } from 'react'

export default function ReportClient({ invoices }) {
  const [selectedSlip, setSelectedSlip] = useState(null)
  const [searchName, setSearchName] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  // Helper function to convert month number to Thai month name
  const getThaiMonthName = (monthNum) => {
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return months[parseInt(monthNum, 10) - 1];
  };

  // Get unique months list from invoices for the filter dropdown
  const availableMonths = useMemo(() => {
    const monthsMap = {};
    invoices.forEach(inv => {
      if (inv.payment_date) {
        // Extract YYYY-MM
        const yyyymm = inv.payment_date.substring(0, 7);
        if (!monthsMap[yyyymm]) {
          const [year, month] = yyyymm.split('-');
          // Convert to Thai Buddhist Year
          const thaiYear = parseInt(year, 10) + 543;
          const label = `${getThaiMonthName(month)} ${thaiYear}`;
          monthsMap[yyyymm] = label;
        }
      }
    });

    // Convert map to array and sort descending (newest first)
    return Object.entries(monthsMap)
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [invoices]);

  // Filter invoices based on name search and month selection
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // 1. Filter by student name (partial search, case insensitive)
      const nameMatch = inv.cus_name
        ? inv.cus_name.toLowerCase().includes(searchName.toLowerCase().trim())
        : false;

      // 2. Filter by month
      let monthMatch = true;
      if (selectedMonth && inv.payment_date) {
        monthMatch = inv.payment_date.startsWith(selectedMonth);
      }

      return nameMatch && monthMatch;
    });
  }, [invoices, searchName, selectedMonth]);

  // Calculate dynamic stats based on filtered data
  const stats = useMemo(() => {
    const total = filteredInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const count = filteredInvoices.length;
    const average = count > 0 ? total / count : 0;
    return { total, count, average };
  }, [filteredInvoices]);

  return (
    <>
      <div className="container-wide mt-4" style={{ padding: '35px 40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        <h2 className="text-center mb-4" style={{ color: '#1a365d', fontWeight: 'bold', fontSize: '2rem' }}>รายงานสรุปยอดชำระเงิน</h2>
        
        {/* Stats Grid */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 text-white" style={{ background: 'linear-gradient(135deg, #1e3d9c, #3b82f6)', borderRadius: '14px', transition: 'transform 0.2s ease', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="card-body p-4 text-center">
                <h6 className="text-uppercase mb-2" style={{ letterSpacing: '1px', opacity: 0.9, fontSize: '0.85rem', fontWeight: '600' }}>ยอดรวมทั้งหมด</h6>
                <h3 className="mb-0 font-weight-bold" style={{ fontSize: '2rem' }}>
                  {stats.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })} <span style={{ fontSize: '1.1rem', fontWeight: 'normal' }}>บาท</span>
                </h3>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '14px', transition: 'transform 0.2s ease', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="card-body p-4 text-center">
                <h6 className="text-uppercase mb-2" style={{ letterSpacing: '1px', opacity: 0.9, fontSize: '0.85rem', fontWeight: '600' }}>ใบเสร็จทั้งหมด</h6>
                <h3 className="mb-0 font-weight-bold" style={{ fontSize: '2rem' }}>
                  {stats.count.toLocaleString('th-TH')} <span style={{ fontSize: '1.1rem', fontWeight: 'normal' }}>รายการ</span>
                </h3>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 text-dark" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', transition: 'transform 0.2s ease', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="card-body p-4 text-center">
                <h6 className="text-uppercase mb-2 text-muted" style={{ letterSpacing: '1px', fontSize: '0.85rem', fontWeight: '600' }}>ยอดเฉลี่ยต่อใบเสร็จ</h6>
                <h3 className="mb-0 font-weight-bold" style={{ fontSize: '2rem', color: '#1a365d' }}>
                  {stats.average.toLocaleString('th-TH', { minimumFractionDigits: 2 })} <span style={{ fontSize: '1.1rem', fontWeight: 'normal', color: '#64748b' }}>บาท</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="card p-4 mb-4 border-0 shadow-sm" style={{ backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <label htmlFor="searchName" style={{ fontWeight: '600', color: '#475569', fontSize: '0.95rem' }}>ค้นหาชื่อนักเรียน</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text bg-white border-right-0" style={{ borderRadius: '10px 0 0 10px', borderColor: '#cbd5e1' }}>
                    <i className="bi bi-search" style={{ color: '#94a3b8' }}></i>
                  </span>
                </div>
                <input 
                  type="text" 
                  id="searchName"
                  className="form-control border-left-0" 
                  placeholder="พิมพ์ชื่อนักเรียนเพื่อค้นหา..." 
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  style={{ borderRadius: '0 10px 10px 0', borderColor: '#cbd5e1', padding: '12px 14px' }}
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <label htmlFor="monthFilter" style={{ fontWeight: '600', color: '#475569', fontSize: '0.95rem' }}>กรองตามเดือนชำระเงิน</label>
              <select 
                id="monthFilter"
                className="form-control" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ borderRadius: '10px', borderColor: '#cbd5e1', padding: '10px 14px', height: 'auto' }}
              >
                <option value="">แสดงทุกเดือน</option>
                {availableMonths.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Data */}
        <div className="table-responsive" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="table table-bordered table-hover bg-white mb-0">
            <thead style={{ backgroundColor: '#1a365d', color: '#ffffff' }}>
              <tr>
                <th style={{ width: '12%', verticalAlign: 'middle', fontWeight: '600' }}>วันที่ชำระ</th>
                <th style={{ verticalAlign: 'middle', fontWeight: '600' }} className="text-left">ชื่อนักเรียน</th>
                <th style={{ verticalAlign: 'middle', fontWeight: '600' }} className="text-left">คลาสเรียน</th>
                <th style={{ width: '18%', verticalAlign: 'middle', fontWeight: '600' }}>ช่องทางชำระเงิน</th>
                <th style={{ width: '15%', verticalAlign: 'middle', fontWeight: '600' }} className="text-right">จำนวนเงิน (บาท)</th>
                <th style={{ width: '15%', verticalAlign: 'middle', fontWeight: '600' }} className="text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? filteredInvoices.map(inv => (
                <tr key={inv.receive_id} style={{ transition: 'background-color 0.15s ease' }}>
                  <td style={{ verticalAlign: 'middle' }}>{new Date(inv.payment_date).toLocaleDateString('th-TH')}</td>
                  <td className="text-left font-weight-bold" style={{ verticalAlign: 'middle', color: '#1e293b' }}>{inv.cus_name}</td>
                  <td className="text-left" style={{ verticalAlign: 'middle' }}>
                    <div style={{ fontWeight: '500', color: '#334155' }}>{inv.class}</div>
                    {inv.discount_details && (
                      <div style={{ fontSize: '0.85rem', marginTop: '4px', color: '#2b59c3', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                        <i className="bi bi-tag-fill" style={{ fontSize: '0.75rem' }}></i>
                        ส่วนลด: {inv.discount_details}
                      </div>
                    )}
                  </td>
                  <td style={{ verticalAlign: 'middle' }}><span className="badge badge-light px-3 py-2" style={{ fontSize: '0.9rem', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569' }}>{inv.bank}</span></td>
                  <td align="right" className="font-weight-bold" style={{ verticalAlign: 'middle', color: '#1e3d9c', fontSize: '1.05rem' }}>
                    {Number(inv.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center" style={{ verticalAlign: 'middle' }}>
                    <div className="d-flex justify-content-center" style={{ gap: '6px' }}>
                      <a 
                        href={`/invoice/${inv.receive_id}`}
                        className="btn btn-sm btn-outline-primary"
                        style={{ borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="ดูใบเสร็จ"
                      >
                        <i className="bi bi-file-earmark-text"></i> ใบเสร็จ
                      </a>
                      {inv.slip_path && (
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setSelectedSlip(inv)}
                          style={{ borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="ดูสลิปหลักฐาน"
                        >
                          <i className="bi bi-image"></i> สลิป
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" align="center" className="text-muted py-5" style={{ fontSize: '1.05rem' }}>
                    <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: '#94a3b8' }}></i>
                    ไม่พบข้อมูลใบเสร็จรับเงินในระบบตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <div 
          className="modal" 
          style={{ display: 'block', position: 'fixed', zIndex: 1050, left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedSlip(null)}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg"
            style={{ margin: 'auto', maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header" style={{ padding: '20px 25px', borderBottom: '1px solid #f1f5f9' }}>
                <h5 className="modal-title" style={{ fontWeight: '700', fontSize: '1.2rem' }}>หลักฐานการโอนเงิน (สลิป)</h5>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => setSelectedSlip(null)}
                  style={{ cursor: 'pointer', fontSize: '1.5rem', border: 'none', background: 'none', color: '#64748b' }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body" style={{ padding: '25px', textAlign: 'center' }}>
                <div className="mb-3" style={{ textAlign: 'left', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', fontSize: '0.95rem' }}>
                  <div className="mb-2"><strong>ชื่อนักเรียน:</strong> <span style={{ color: '#1e293b' }}>{selectedSlip.cus_name}</span></div>
                  <div className="mb-2"><strong>จำนวนเงิน:</strong> <span style={{ color: '#10b981', fontWeight: '700' }}>{Number(selectedSlip.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span></div>
                  <div className="mb-2"><strong>วันที่ชำระ:</strong> <span style={{ color: '#475569' }}>{new Date(selectedSlip.payment_date).toLocaleDateString('th-TH')}</span></div>
                  {selectedSlip.discount_details && (
                    <div><strong>รายละเอียดส่วนลด:</strong> <span style={{ color: '#2b59c3', fontWeight: '500' }}>{selectedSlip.discount_details}</span></div>
                  )}
                </div>
                <img 
                  src={selectedSlip.slip_path} 
                  alt="สลิปโอนเงิน" 
                  style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3Eไม่สามารถโหลดรูปภาพสลิปได้%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
              <div className="modal-footer" style={{ padding: '15px 25px', borderTop: '1px solid #f1f5f9' }}>
                <a 
                  href={selectedSlip.slip_path} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                  download
                >
                  <i className="bi bi-download mr-1"></i> ดาวน์โหลดรูปภาพ
                </a>
                <button 
                  type="button" 
                  className="btn btn-light" 
                  onClick={() => setSelectedSlip(null)}
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

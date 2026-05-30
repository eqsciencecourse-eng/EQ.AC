import { supabase } from '@/utils/supabase'
import ClientPrint from './ClientPrint'

// Helper function to convert number to Thai Baht text
function bahtText(number) {
  if (!number || isNaN(number)) return 'ศูนย์บาทถ้วน';
  
  const numberStr = parseFloat(number).toFixed(2);
  const [bahtStr, satangStr] = numberStr.split('.');
  
  const THAI_NUMBERS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const THAI_UNITS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  
  function convertSection(numStr) {
    let result = '';
    const len = numStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(numStr[i]);
      const pos = len - 1 - i;
      if (digit !== 0) {
        if (pos === 0 && digit === 1 && len > 1) {
          result += 'เอ็ด';
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่';
        } else if (pos === 1 && digit === 1) {
          // skip 'หนึ่ง' in 'หนึ่งสิบ'
        } else {
          result += THAI_NUMBERS[digit];
        }
        result += THAI_UNITS[pos % 6];
      }
      if (pos % 6 === 0 && pos > 0) {
        result += 'ล้าน';
      }
    }
    return result;
  }

  let bahtTextResult = '';
  const bahtVal = parseInt(bahtStr);
  if (bahtVal > 0) {
    bahtTextResult += convertSection(bahtStr) + 'บาท';
  } else if (bahtVal === 0 && parseInt(satangStr) > 0) {
    // zero baht, only satangs
  } else {
    return 'ศูนย์บาทถ้วน';
  }

  const satangVal = parseInt(satangStr);
  if (satangVal === 0) {
    bahtTextResult += 'ถ้วน';
  } else {
    bahtTextResult += convertSection(satangStr) + 'สตางค์';
  }

  return bahtTextResult;
}

export default async function InvoiceView({ params }) {
  // Await the params promise (Next.js 15+ convention)
  const resolvedParams = await params
  const id = resolvedParams.id

  const { data: invoice, error } = await supabase
    .from('invoice')
    .select('*')
    .eq('receive_id', id)
    .single()

  if (error || !invoice) {
    return (
      <div className="container text-center mt-5">
        <div className="alert alert-danger d-inline-block">
          <h4>ไม่พบข้อมูลใบเสร็จ</h4>
          <p className="mb-0">กรุณาตรวจสอบหมายเลขใบเสร็จอีกครั้ง</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', padding: '10px', fontFamily: "'Sarabun', 'Inter', sans-serif" }}>
      <ClientPrint invoice={invoice} />
      
      {/* Outer border container */}
      <div className="receipt-container" style={{ border: '2px solid #2b59c3', padding: '40px', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        
        {/* Header Section */}
        <div className="row align-items-center mb-4">
          <div className="col-2 text-center">
            <img src="/img/eqscience.png" width="80" height="80" alt="ตราสถาบัน" style={{ objectFit: 'contain' }} />
          </div>
          <div className="col-10 text-left">
            <h3 className="mb-1" style={{ fontWeight: '700', color: '#1a365d', letterSpacing: '0.5px' }}>โรงเรียนต้นแบบนวัตกรรมและเทคโนโลยี</h3>
            <small className="text-muted" style={{ fontSize: '0.9rem', fontWeight: '500' }}>133/51 จ.ระยอง 21000 เพลินใจ 3 เยื้อง บขส.2 ถ.บายพาส-ทับมา</small>
          </div>
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-4" style={{ backgroundColor: '#1a365d', color: 'white', padding: '10px 0', borderRadius: '6px' }}>
          <h4 className="mb-0" style={{ fontWeight: '700', letterSpacing: '2px' }}>ใบเสร็จรับเงิน</h4>
        </div>

        {/* Invoice Meta Details */}
        <div className="row mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          <div className="col-7">
            <div><strong>ได้รับเงินจาก:</strong> <span style={{ color: '#2d3748', fontWeight: '500' }}>{invoice.cus_name}</span></div>
          </div>
          <div className="col-5 text-right">
            <div><strong>เลขที่ใบเสร็จ:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '1.15rem', color: '#1a365d' }}>{invoice.receive_id}</span></div>
            <div><strong>วันที่ชำระเงิน:</strong> {new Date(invoice.payment_date).toLocaleDateString('th-TH')}</div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="table-responsive mb-4">
          <table className="table table-bordered" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
            <thead style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}>
              <tr>
                <th className="text-center" style={{ width: '10%', borderBottom: '2px solid #cbd5e1', fontWeight: '600' }}>ลำดับ</th>
                <th className="text-left" style={{ borderBottom: '2px solid #cbd5e1', fontWeight: '600' }}>รายการชำระเงิน</th>
                <th className="text-right" style={{ width: '25%', borderBottom: '2px solid #cbd5e1', fontWeight: '600' }}>จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center" style={{ verticalAlign: 'middle' }}>1</td>
                <td className="text-left">
                  <strong style={{ color: '#1e293b' }}>ค่าเรียนหลักสูตร:</strong> {invoice.class}
                  <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                    ระยะเวลาเรียน: {new Date(invoice.date_start).toLocaleDateString('th-TH')} ถึง {new Date(invoice.date_end).toLocaleDateString('th-TH')}
                  </div>
                  {invoice.discount_details && (
                    <div style={{ fontSize: '0.9rem', marginTop: '8px', color: '#2b59c3', fontWeight: '500', padding: '6px 10px', backgroundColor: '#eff6ff', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
                      <strong>รายละเอียดเพิ่มเติม/ส่วนลด:</strong> {invoice.discount_details}
                    </div>
                  )}
                </td>
                <td className="text-right" style={{ verticalAlign: 'middle', fontWeight: '600', color: '#1e293b', fontSize: '1.05rem' }}>
                  {Number(invoice.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {/* Summary Row */}
              <tr>
                <td colSpan="2" className="text-right" style={{ fontWeight: '700', backgroundColor: '#f8fafc', color: '#1e293b' }}>
                  รวมเงินทั้งสิ้น
                </td>
                <td className="text-right" style={{ fontWeight: '700', color: '#1a365d', fontSize: '1.15rem', backgroundColor: '#f8fafc' }}>
                  {Number(invoice.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {/* Thai Words Row */}
              <tr>
                <td colSpan="3" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px' }}>
                  <strong>จำนวนเงินตัวอักษร:</strong> <span style={{ color: '#1e3d9c', fontWeight: '700' }}>{bahtText(invoice.amount)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer / Signature Section */}
        <div className="row mt-5 pt-3 align-items-end">
          <div className="col-6">
            <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
              * ใบเสร็จรับเงินนี้จะสมบูรณ์ต่อเมื่อสถาบันได้รับการชำระเงินเสร็จสิ้นแล้ว<br />
              * ขอบคุณที่ไว้วางใจให้เราดูแลบุตรหลานของท่าน
            </div>
          </div>
          <div className="col-6 text-center">
            <div style={{ display: 'inline-block', position: 'relative' }}>
              {/* Signature Image */}
              <img src="/img/licene.png" width="130" height="auto" alt="ลายมือชื่อ" style={{ display: 'block', margin: '0 auto -10px auto' }} />
              <div style={{ borderTop: '1px dotted #64748b', width: '220px', margin: '10px auto 5px auto' }}></div>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>ผู้รับเงิน</div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>วันที่: {new Date(invoice.payment_date).toLocaleDateString('th-TH')}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Hide navbar on this page by overriding via CSS & printer settings */}
      <style dangerouslySetInnerHTML={{__html: `
        nav { display: none !important; }
        @media print {
          body { -webkit-print-color-adjust: exact; background-color: white !important; }
          .no-print { display: none !important; }
          .receipt-container { 
            border: 1px solid #000 !important; 
            box-shadow: none !important; 
            margin: 0 !important; 
            padding: 20px !important; 
            border-radius: 0 !important;
          }
        }
      `}} />
    </div>
  )
}

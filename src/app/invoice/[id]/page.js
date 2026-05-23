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
          <h4>ไม่พบข้อมูลใบเสร็จ (Invoice not found)</h4>
          <p className="mb-0">กรุณาตรวจสอบหมายเลขใบเสร็จอีกครั้ง</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', padding: '10px', fontFamily: "'Sarabun', 'Inter', sans-serif" }}>
      <ClientPrint />
      
      {/* Outer border container */}
      <div className="receipt-container" style={{ border: '2px solid #333', padding: '30px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        
        {/* Header Section */}
        <div className="row align-items-center mb-4">
          <div className="col-2 text-center">
            <img src="/img/eqscience.png" width="70" height="70" alt="Logo" style={{ objectFit: 'contain' }} />
          </div>
          <div className="col-10 text-left">
            <h4 className="mb-1" style={{ fontWeight: 'bold', color: '#1a365d' }}>โรงเรียนต้นแบบนวัตกรรมและเทคโนโลยี</h4>
            <h5 className="mb-0 text-muted" style={{ fontSize: '1.05rem', fontWeight: '500' }}>Innovation & Technology School</h5>
            <small className="text-muted">เลขผู้เสียภาษี / สถาบันการเรียนรู้เพื่ออนาคต</small>
          </div>
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-4" style={{ backgroundColor: '#2153ab', color: 'white', padding: '8px 0', borderRadius: '4px' }}>
          <h4 className="mb-0" style={{ fontWeight: 'bold', letterSpacing: '1px' }}>ใบเสร็จรับเงิน / RECEIPT</h4>
        </div>

        {/* Invoice Meta Details */}
        <div className="row mb-4" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
          <div className="col-7">
            <div><strong>ได้รับเงินจาก (Received From):</strong> {invoice.cus_name}</div>
          </div>
          <div className="col-5 text-right">
            <div><strong>เลขที่ (Receipt No.):</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1rem' }}>{invoice.receive_id}</span></div>
            <div><strong>วันที่ (Date):</strong> {new Date(invoice.payment_date).toLocaleDateString('th-TH')}</div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="table-responsive mb-4">
          <table className="table table-bordered" style={{ border: '1px solid #dee2e6' }}>
            <thead style={{ backgroundColor: '#f8f9fa', color: '#333' }}>
              <tr>
                <th className="text-center" style={{ width: '8%', borderBottom: '2px solid #dee2e6' }}>ลำดับ<br/><small>No.</small></th>
                <th className="text-left" style={{ borderBottom: '2px solid #dee2e6' }}>รายการชำระเงิน<br/><small>Description</small></th>
                <th className="text-right" style={{ width: '25%', borderBottom: '2px solid #dee2e6' }}>จำนวนเงิน (บาท)<br/><small>Amount (THB)</small></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center" style={{ verticalAlign: 'middle' }}>1</td>
                <td>
                  <strong>ค่าเรียนหลักสูตร:</strong> {invoice.class}
                  <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                    ระยะเวลาเรียน: {new Date(invoice.date_start).toLocaleDateString('th-TH')} ถึง {new Date(invoice.date_end).toLocaleDateString('th-TH')}
                  </div>
                </td>
                <td className="text-right" style={{ verticalAlign: 'middle', fontWeight: '500' }}>
                  {Number(invoice.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {/* Summary Row */}
              <tr>
                <td colSpan="2" className="text-right" style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                  รวมเงินทั้งสิ้น (Total Amount)
                </td>
                <td className="text-right" style={{ fontWeight: 'bold', color: '#2153ab', fontSize: '1.1rem', backgroundColor: '#fafafa' }}>
                  {Number(invoice.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {/* Thai Words Row */}
              <tr>
                <td colSpan="3" style={{ backgroundColor: '#eef4f8', border: '1px solid #cce2f3' }}>
                  <strong>จำนวนเงินตัวอักษร (Amount in Words):</strong> <span style={{ color: '#1a365d', fontWeight: 'bold' }}>{bahtText(invoice.amount)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer / Signature Section */}
        <div className="row mt-5 pt-3 align-items-end">
          <div className="col-6">
            <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
              * ใบเสร็จรับเงินนี้จะสมบูรณ์ต่อเมื่อสถาบันได้รับการชำระเงินเสร็จสิ้นแล้ว<br />
              * ขอบคุณที่ไว้วางใจให้เราดูแลบุตรหลานของท่าน
            </div>
          </div>
          <div className="col-6 text-center">
            <div style={{ display: 'inline-block', position: 'relative' }}>
              {/* Signature Image */}
              <img src="/img/licene.png" width="120" height="auto" alt="Signature" style={{ display: 'block', margin: '0 auto -10px auto' }} />
              <div style={{ borderTop: '1px dotted #333', width: '220px', margin: '10px auto 5px auto' }}></div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>ผู้รับเงิน / Receiver</div>
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

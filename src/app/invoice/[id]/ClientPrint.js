'use client'

import { useState } from 'react'

export default function ClientPrint({ invoice }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const loadHtml2Canvas = () => {
    return new Promise((resolve, reject) => {
      if (window.html2canvas) {
        resolve(window.html2canvas);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => resolve(window.html2canvas);
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  };

  const handleDownload = (format) => {
    const element = document.querySelector('.receipt-container');
    if (!element) {
      alert('ไม่พบส่วนเนื้อหาใบเสร็จเพื่อบันทึกรูปภาพ');
      return;
    }

    setIsGenerating(true);

    loadHtml2Canvas()
      .then(html2canvas => {
        // Ensure image references and background are fully rendered
        return html2canvas(element, {
          useCORS: true,
          scale: 2, // Double resolution for crystal clear image quality
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true
        });
      })
      .then(canvas => {
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const fileExt = format === 'jpeg' ? 'jpg' : 'png';
        const dataUrl = canvas.toDataURL(mimeType, format === 'jpeg' ? 0.95 : undefined);
        
        const link = document.createElement('a');
        const studentName = invoice?.cus_name ? invoice.cus_name.replace(/\s+/g, '_') : 'นักเรียน';
        const receiptNo = invoice?.receive_id || 'ใบเสร็จ';
        
        link.download = `ใบเสร็จรับเงิน_เลขที่_${receiptNo}_${studentName}.${fileExt}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsGenerating(false);
      })
      .catch(err => {
        console.error('Error generating image:', err);
        alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ กรุณาลองใหม่อีกครั้ง');
        setIsGenerating(false);
      });
  };

  return (
    <div className="no-print d-flex justify-content-end align-items-center mb-4" style={{ gap: '10px' }}>
      <button 
        onClick={() => window.print()} 
        className="btn btn-primary shadow-sm" 
        style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}
        disabled={isGenerating}
      >
        <i className="bi bi-printer"></i> พิมพ์ใบเสร็จ
      </button>
      <button 
        onClick={() => handleDownload('png')} 
        className="btn btn-success shadow-sm" 
        style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}
        disabled={isGenerating}
      >
        <i className="bi bi-file-image"></i> {isGenerating ? 'กำลังสร้าง...' : 'บันทึกเป็น PNG'}
      </button>
      <button 
        onClick={() => handleDownload('jpeg')} 
        className="btn btn-info shadow-sm" 
        style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '500', color: '#fff' }}
        disabled={isGenerating}
      >
        <i className="bi bi-file-image-fill"></i> {isGenerating ? 'กำลังสร้าง...' : 'บันทึกเป็น JPEG'}
      </button>
    </div>
  )
}

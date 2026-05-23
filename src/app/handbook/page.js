export default function HandbookPage() {
  return (
    <div className="container" style={{ maxWidth: '850px', marginTop: '40px' }}>
      <h2 className="text-center mb-4" style={{ color: '#1a365d', fontWeight: 'bold' }}>คู่มือการใช้งานเว็บไซต์</h2>
      
      <div className="embed-responsive embed-responsive-16by9 mb-4" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <iframe className="embed-responsive-item" src="https://www.canva.com/design/DAGIqdDXy0g/Zy5pcc6KRkq3XNiEZPyZ9A/view?embed" allowFullScreen="allowfullscreen" allow="fullscreen"></iframe>
      </div>

      <div className="text-center">
          <a href="https://www.canva.com/design/DAGIqdDXy0g/Zy5pcc6KRkq3XNiEZPyZ9A/view?utm_content=DAGIqdDXy0g&utm_campaign=designshare&utm_medium=embeds&utm_source=link" className="btn btn-primary px-4 py-2" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-file-earmark-pdf mr-1"></i> เปิดดูคู่มือแบบเต็มจอ (Canva)
          </a>
          <div className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>จัดทำโดย: นายฐาปกรณ์ จันทร์ทอง</div>
      </div>
    </div>
  )
}


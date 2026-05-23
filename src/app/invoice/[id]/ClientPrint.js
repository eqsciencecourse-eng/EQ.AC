'use client'

export default function ClientPrint() {
  return (
    <div className="no-print" style={{ marginBottom: '20px', textAlign: 'right' }}>
      <button onClick={() => window.print()} className="btn btn-primary">
        พิมพ์ (Print)
      </button>
    </div>
  )
}


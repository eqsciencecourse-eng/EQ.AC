import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-mainbg">
      <div className="container-fluid max-width-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', width: '100%' }}>
        <Link className="navbar-brand d-flex align-items-center" href="/">
          <img src="/img/eqscience.png" width="40" height="40" className="d-inline-block align-top mr-2" alt="Logo" />
          <span style={{ fontWeight: '700', fontSize: '1.2rem', letterSpacing: '0.5px' }}>EQ Science</span>
        </Link>
        
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" href="/">
                <i className="bi bi-pc-display"></i>ระบบชำระเงิน
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/dashboard">
                <i className="bi bi-receipt-cutoff"></i>ใบเสร็จนักเรียน
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/report">
                <i className="bi bi-table"></i>รายงานสรุป
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/handbook">
                <i className="bi bi-book"></i>คู่มือการใช้งาน
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}


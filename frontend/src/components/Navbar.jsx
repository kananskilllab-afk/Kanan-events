import React from 'react';
import logoUrl from '../assets/logo.png';

function Navbar({ onOpenCallback, onOpenBooking }) {
    return (
        <>
            {/* TOPBAR */}
            <div className="topbar">
                <div className="container">
                    <span>📞 +91 265 235 4400 &nbsp;|&nbsp; 📱 24×7 Helpline: <a href="tel:+916356568111" style={{ color: '#FFB347', fontWeight: '700' }}>+91 6356 568111</a> &nbsp;|&nbsp; ✉️ info@kanan.co</span>
                    <span>🏆 25+ Years &nbsp;•&nbsp; 2,40,000+ Students &nbsp;•&nbsp; 98% Visa Success Rate</span>
                </div>
            </div>

            {/* NAVBAR */}
            <nav className="navbar">
                <div className="container nav-inner">
                    <a href="#" className="logo">
                        <img src={logoUrl} alt="Kanan.co" style={{ height: '42px', objectFit: 'contain' }} />
                    </a>
                    <div className="nav-actions">
                        <a href="tel:+916356568111" className="btn btn-helpline">📱 24×7: 6356 568111</a>
                        <button className="btn btn-outline" onClick={onOpenCallback}>Request Callback</button>
                        <button className="btn btn-primary" onClick={onOpenBooking}>Free Counselling</button>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;

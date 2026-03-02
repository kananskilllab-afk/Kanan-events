import React, { useState } from 'react';
import { counsellors } from '../data/teamData';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const morningTimes = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
const afternoonTimes = ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'];
const eveningTimes = ['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'];

function generateICS(dateStr, timeStr, name, counsellor, mode) {
    const [y, m, d] = dateStr.split('-').map(Number);
    let [tp, ampm] = timeStr.split(' ');
    let [hr, mn] = tp.split(':').map(Number);
    if (ampm === 'PM' && hr !== 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;
    const startUTC = new Date(Date.UTC(y, m - 1, d, hr - 5, mn - 30));
    const endUTC = new Date(startUTC.getTime() + 30 * 60 * 1000);
    const fmt = dt => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const location = mode === 'inperson' ? 'Kanan House, 2nd Floor, Trident Complex, Vadodara - 390007' : 'Online - Zoom Video Call';
    const desc = `Free 1:1 Counselling at Kanan International\\\\nCounsellor: ${counsellor?.name}\\\\n24x7: +91 6356 568111`;
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kanan//EN', 'BEGIN:VEVENT',
        `DTSTART:${fmt(startUTC)}`, `DTEND:${fmt(endUTC)}`, `DTSTAMP:${fmt(new Date())}`,
        `UID:${Date.now()}@kanan.co`, `SUMMARY:Kanan Counselling — ${name} with ${counsellor?.name}`,
        `DESCRIPTION:${desc}`, `LOCATION:${location}`, 'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

export function BookingModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState('inperson');
    const [calMonth, setCalMonth] = useState(2);
    const [calYear, setCalYear] = useState(2026);
    const [selDate, setSelDate] = useState(null);
    const [dateLabel, setDateLabel] = useState('');
    const [selTime, setSelTime] = useState(null);
    const [selCounsellor, setSelCounsellor] = useState(null);
    const [confirmed, setConfirmed] = useState(false);
    const [booking, setBooking] = useState(null);
    const [emailTab, setEmailTab] = useState('student');
    const [form, setForm] = useState({ name: '', phone: '', email: '', dest: '', edu: '', notes: '' });

    const reset = () => { setStep(1); setMode('inperson'); setSelDate(null); setDateLabel(''); setSelTime(null); setSelCounsellor(null); setConfirmed(false); setBooking(null); setEmailTab('student'); setForm({ name: '', phone: '', email: '', dest: '', edu: '', notes: '' }); };

    if (!isOpen) return null;

    // ── Calendar ──
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date();
    const calDays = [];
    for (let i = 0; i < firstDay; i++) calDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

    const selectDate = (day) => {
        const dateObj = new Date(calYear, calMonth, day);
        if (dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
        if (dateObj.getDay() === 0) return;
        const ds = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dl = `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()]}, ${day} ${MONTHS[calMonth]} ${calYear}`;
        setSelDate(ds); setDateLabel(dl);
    };

    const renderSlots = (times) => times.map(t => {
        const hash = (t.charCodeAt(0) + t.charCodeAt(3) + (selDate || '').charCodeAt(9) || 0) % 7;
        return (
            <button key={t} type="button" className={`time-slot${hash === 0 ? ' unavail' : ''}${selTime === t ? ' selected' : ''}`}
                onClick={() => hash !== 0 && setSelTime(t)} disabled={hash === 0}>
                {t}
            </button>
        );
    });

    const confirmBooking = (e) => {
        e.preventDefault();
        const bookRef = 'KN-' + Date.now().toString(36).toUpperCase().slice(-6);
        setBooking({
            ...form, bookRef, counsellor: selCounsellor, mode, dateLabel, time: selTime,
            icsContent: generateICS(selDate, selTime, form.name, selCounsellor, mode)
        });
        setConfirmed(true);
    };

    const downloadICS = () => {
        const blob = new Blob([booking.icsContent], { type: 'text/calendar' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `kanan-booking-${booking.bookRef}.ics`; a.click();
    };

    const googleCal = () => {
        const [y, m, d] = selDate.split('-').map(Number);
        let [tp, ampm] = selTime.split(' '); let [hr, mn] = tp.split(':').map(Number);
        if (ampm === 'PM' && hr !== 12) hr += 12; if (ampm === 'AM' && hr === 12) hr = 0;
        const st = new Date(Date.UTC(y, m - 1, d, hr - 5, mn - 30));
        const et = new Date(st.getTime() + 30 * 60 * 1000);
        const fmt = dt => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Kanan Counselling — ${booking.name}`)}&dates=${fmt(st)}/${fmt(et)}&location=${encodeURIComponent('Kanan International, Vadodara')}`, '_blank');
    };

    const mLbl = mode === 'inperson' ? 'In-Person · Head Office, Vadodara' : 'Online · Zoom Video Call';

    if (confirmed && booking) return (
        <div className="modal-overlay active" onClick={e => { if (e.target === e.currentTarget) { onClose(); reset(); } }}>
            <div className="modal confirm-modal-inner">
                <div className="modal-head"><h3>✅ Booking Confirmed!</h3><button className="modal-x" onClick={() => { onClose(); reset(); }}>✕</button></div>
                <div className="modal-body">
                    <div className="confirm-summary-card">
                        <h3>🎉 Your session is booked!</h3>
                        <div className="confirm-row"><div className="cr-icon">📅</div><div><div className="cr-label">Date & Time</div><div className="cr-value">{booking.dateLabel} · {booking.time}</div></div></div>
                        <div className="confirm-row"><div className="cr-icon">👤</div><div><div className="cr-label">Counsellor</div><div className="cr-value">{booking.counsellor?.name} — {booking.counsellor?.dept}</div></div></div>
                        <div className="confirm-row"><div className="cr-icon">{mode === 'inperson' ? '🏢' : '💻'}</div><div><div className="cr-label">Mode</div><div className="cr-value">{mode === 'inperson' ? 'In-Person' : 'Online (Zoom)'}</div></div></div>
                        <div className="confirm-row"><div className="cr-icon">🏷️</div><div><div className="cr-label">Booking Ref</div><div className="cr-value">{booking.bookRef}</div></div></div>
                        <div className="confirm-badge">✅ FREE · 30 min session · Confirmed</div>
                    </div>

                    <div className="email-tabs">
                        <button className={`email-tab${emailTab === 'student' ? ' active' : ''}`} onClick={() => setEmailTab('student')}>📩 Your Confirmation</button>
                        <button className={`email-tab${emailTab === 'counsellor' ? ' active' : ''}`} onClick={() => setEmailTab('counsellor')}>📩 Counsellor Copy</button>
                    </div>
                    <div className="email-preview">
                        <div className={`email-preview-pane${emailTab === 'student' ? ' active' : ''}`}>
                            <div className="ep-header">
                                <div className="ep-header-row"><strong>To:</strong> {booking.email}</div>
                                <div className="ep-header-row"><strong>Subject:</strong> ✅ Booking Confirmed — Ref: {booking.bookRef}</div>
                            </div>
                            <div className="ep-body">
                                Dear <strong>{booking.name}</strong>, your free 1:1 counselling session is confirmed!
                                <div className="ep-details-box">
                                    <div>📅 <strong>Date:</strong> {booking.dateLabel}</div>
                                    <div>🕐 <strong>Time:</strong> {booking.time} (30 min)</div>
                                    <div>👤 <strong>Counsellor:</strong> {booking.counsellor?.name}</div>
                                    <div>{mode === 'inperson' ? '🏢' : '💻'} <strong>Mode:</strong> {mLbl}</div>
                                </div>
                                <div className="ep-footer">📱 24×7 Helpline: +91 6356 568111 | www.kanan.co</div>
                            </div>
                        </div>
                        <div className={`email-preview-pane${emailTab === 'counsellor' ? ' active' : ''}`}>
                            <div className="ep-header">
                                <div className="ep-header-row"><strong>To:</strong> {booking.counsellor?.email}</div>
                                <div className="ep-header-row"><strong>Subject:</strong> 📅 New Booking — {booking.name} | {booking.dateLabel}</div>
                            </div>
                            <div className="ep-body">
                                Hi <strong>{booking.counsellor?.name}</strong>, a new session has been booked with you.
                                <div className="ep-details-box">
                                    <div>👤 {booking.name} · 📱 {booking.phone}</div>
                                    <div>📅 {booking.dateLabel} · 🕐 {booking.time}</div>
                                    <div>🌍 Interested: {booking.dest || 'Not specified'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="confirm-actions-grid">
                        <button className="confirm-action-btn" onClick={downloadICS}><div className="ca-icon" style={{ background: '#E8F1FF', color: '#0052CC' }}>📅</div><span className="ca-title">Add to Calendar</span><span className="ca-desc">Download .ics</span></button>
                        <button className="confirm-action-btn" onClick={googleCal}><div className="ca-icon" style={{ background: '#FFF0E0', color: '#FF6B00' }}>📆</div><span className="ca-title">Google Calendar</span><span className="ca-desc">Add directly</span></button>
                    </div>
                    <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} onClick={() => { onClose(); reset(); }}>Done — Close</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay active" onClick={e => { if (e.target === e.currentTarget) { onClose(); reset(); } }}>
            <div className="modal book-modal-inner">
                <div className="modal-head">
                    <h3>📅 Book Free 1:1 Counselling</h3>
                    <button className="modal-x" onClick={() => { onClose(); reset(); }}>✕</button>
                </div>
                <div className="modal-body">
                    {/* Steps */}
                    <div className="book-steps">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className={`book-step${step === n ? ' active' : ''}${step > n ? ' done' : ''}`}>
                                <div className="book-step-dot">{step > n ? '✓' : n}</div>
                                <div className="book-step-label">{['Date', 'Time', 'Counsellor', 'Details'][n - 1]}</div>
                            </div>
                        ))}
                    </div>

                    {/* STEP 1: Date */}
                    {step === 1 && (
                        <div>
                            <div className="session-types">
                                {[['inperson', '🏢', 'In-Person', 'Visit our Vadodara office'], ['online', '💻', 'Online (Zoom)', 'Video call from anywhere']].map(([m, icon, label, desc]) => (
                                    <div key={m} className={`session-type${mode === m ? ' selected' : ''}`} onClick={() => setMode(m)}>
                                        <div className="st-icon">{icon}</div><h5>{label}</h5><p>{desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="cal-header">
                                <button className="cal-nav" disabled={calYear === 2026 && calMonth <= 2} onClick={() => { let m = calMonth - 1, y = calYear; if (m < 0) { m = 11; y--; } setCalMonth(m); setCalYear(y); }}>‹</button>
                                <h4>{MONTHS[calMonth]} {calYear}</h4>
                                <button className="cal-nav" onClick={() => { let m = calMonth + 1, y = calYear; if (m > 11) { m = 0; y++; } setCalMonth(m); setCalYear(y); }}>›</button>
                            </div>
                            <div className="cal-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d}>{d}</span>)}</div>
                            <div className="cal-days">
                                {calDays.map((day, i) => {
                                    if (!day) return <div key={i} className="cal-day empty" />;
                                    const dateObj = new Date(calYear, calMonth, day);
                                    const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                    const isSun = dateObj.getDay() === 0;
                                    const ds = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    return <button key={i} type="button" className={`cal-day${isPast || isSun ? ' disabled' : ''}${selDate === ds ? ' selected' : ''}`} onClick={() => !isPast && !isSun && selectDate(day)}>{day}</button>;
                                })}
                            </div>
                            {selDate && <div className="book-selected-info show">📅 {dateLabel}</div>}
                            <div className="book-nav"><button className="btn btn-primary btn-lg" disabled={!selDate} onClick={() => setStep(2)}>Next — Select Time →</button></div>
                        </div>
                    )}

                    {/* STEP 2: Time */}
                    {step === 2 && (
                        <div>
                            <p style={{ fontSize: '13px', color: 'var(--k-ink-soft)', marginBottom: '14px' }}>Pick a time slot on <strong>{dateLabel}</strong></p>
                            <div className="time-period">🌅 MORNING</div><div className="time-slots">{renderSlots(morningTimes)}</div>
                            <div className="time-period">🌞 AFTERNOON</div><div className="time-slots">{renderSlots(afternoonTimes)}</div>
                            <div className="time-period">🌆 EVENING</div><div className="time-slots">{renderSlots(eveningTimes)}</div>
                            {selTime && <div className="book-selected-info show">🕐 {selTime} · 30 min session</div>}
                            <div className="book-nav">
                                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                                <button className="btn btn-primary btn-lg" disabled={!selTime} onClick={() => setStep(3)}>Next — Counsellor →</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Counsellor */}
                    {step === 3 && (
                        <div>
                            <p style={{ fontSize: '13px', color: 'var(--k-ink-soft)', marginBottom: '14px' }}>Choose your counsellor by destination interest</p>
                            <div className="counsellor-grid">
                                {counsellors.map(c => (
                                    <div key={c.name} className={`counsellor-card${selCounsellor?.name === c.name ? ' selected' : ''}`} onClick={() => setSelCounsellor(c)}>
                                        <div className="counsellor-avatar" style={{ background: c.color }}>{c.initials}</div>
                                        <h5>{c.name}</h5><p>{c.dept}</p>
                                    </div>
                                ))}
                            </div>
                            {selCounsellor && <div className="book-selected-info show">👤 {selCounsellor.name} — {selCounsellor.dept}</div>}
                            <div className="book-nav">
                                <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                                <button className="btn btn-primary btn-lg" disabled={!selCounsellor} onClick={() => setStep(4)}>Next — Your Details →</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Details */}
                    {step === 4 && (
                        <div>
                            <div className="book-summary">
                                <div className="book-summary-row"><span className="label">📅 Date</span><span className="value">{dateLabel}</span></div>
                                <div className="book-summary-row"><span className="label">🕐 Time</span><span className="value">{selTime} (30 min)</span></div>
                                <div className="book-summary-row"><span className="label">👤 Counsellor</span><span className="value">{selCounsellor?.name}</span></div>
                                <div className="book-summary-row"><span className="label">{mode === 'inperson' ? '🏢' : '💻'} Mode</span><span className="value">{mLbl}</span></div>
                                <div className="book-summary-row"><span className="label">💰 Fee</span><span className="value" style={{ color: 'var(--k-green)' }}>FREE</span></div>
                            </div>
                            <form onSubmit={confirmBooking}>
                                <div className="form-row">
                                    <div className="form-group"><label>Full Name *</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" /></div>
                                    <div className="form-group"><label>Mobile *</label><input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" /></div>
                                </div>
                                <div className="form-group"><label>Email *</label><input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your.email@example.com" /></div>
                                <div className="form-row">
                                    <div className="form-group"><label>Interested Destination</label>
                                        <select value={form.dest} onChange={e => setForm(f => ({ ...f, dest: e.target.value }))}>
                                            <option value="">Select</option>{['Canada', 'UK', 'USA', 'Australia', 'Germany', 'Dubai', 'Europe', 'Not sure yet'].map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Education Level</label>
                                        <select value={form.edu} onChange={e => setForm(f => ({ ...f, edu: e.target.value }))}>
                                            <option value="">Select</option>{["12th / HSC", "Bachelor's", "Master's", "Working Professional"].map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group"><label>Questions? (Optional)</label><input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Scholarship options for Canada" /></div>
                                <div className="book-nav">
                                    <button type="button" className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                                    <button type="submit" className="btn btn-orange btn-lg">✅ Confirm Booking</button>
                                </div>
                                <p className="form-note">Free session · 30 min · No obligations<br />📱 24×7: <a href="tel:+916356568111" style={{ color: 'var(--k-green)', textDecoration: 'none', fontWeight: '700' }}>+91 6356 568111</a></p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookingModal;

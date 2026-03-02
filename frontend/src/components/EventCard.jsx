import React from 'react';

function EventCard({ event: ev, onOpenRegister, onOpenInvite, onOpenVcard }) {
  const dateNum = ev.dateDayStr || '?';
  const dateMon = ev.dateMonthStr ? ev.dateMonthStr.toUpperCase().slice(0, 3) : 'MAR';
  const dayShort = ev.day ? ev.day.substring(0, 3) : '';

  return (
    <div className="ev-card">
      <div className={`ev-ribbon ${ev.type || 'seminar'}`}></div>
      <div className="ev-body">
        <div className="ev-top">
          <div className="ev-date-badge">
            <div className="ev-date-num">{dateNum}</div>
            <div className="ev-date-mon">{dateMon}</div>
            {dayShort && <div className="ev-date-day">{dayShort.toUpperCase()}</div>}
          </div>
          <div className="ev-info">
            {ev.mainEvent && <div className="ev-main-event">{ev.mainEvent}</div>}
            <h3>{ev.title || ev.activity}</h3>
            {ev.subtitle && <p style={{ fontSize: '12px', color: 'var(--k-ink-muted)', marginTop: '2px' }}>{ev.subtitle}</p>}
          </div>
        </div>

        <div className="ev-meta">
          {(ev.teamLead || ev.leadName) && (
            <span>
              👤 {ev.teamLead || ev.leadName}
              {onOpenVcard && (
                <button
                  className="btn-eye"
                  style={{ marginLeft: '6px' }}
                  onClick={(e) => { e.stopPropagation(); onOpenVcard(ev.teamLead || ev.leadName); }}
                  title="View contact card"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              )}
            </span>
          )}
          {(ev.venue || ev.branch) && <span>📍 {ev.venue || ev.branch}</span>}
          {ev.time && <span>🕐 {ev.time}</span>}
          {ev.isOnline !== undefined && <span>{ev.isOnline ? '💻 Online' : '🏢 In-Person'}</span>}
        </div>

        {ev.tags && ev.tags.length > 0 && (
          <div className="ev-tags">
            {ev.tags.map((t, i) => (
              <span key={i} className={`ev-tag ${t.type || 'country'}`}>{t.label || t}</span>
            ))}
          </div>
        )}

        {(ev.country || ev.mode || ev.dept) && !ev.tags?.length && (
          <div className="ev-tags">
            {ev.country && <span className="ev-tag country">{ev.country}</span>}
            {ev.mode && <span className="ev-tag mode">{ev.mode}</span>}
            {ev.dept && <span className="ev-tag dept">{ev.dept}</span>}
          </div>
        )}

        <div className="ev-foot">
          <button className="btn btn-primary" onClick={onOpenRegister}>Register</button>
          <button className="btn-invite" onClick={onOpenInvite}>⬇ Invitation</button>
        </div>
      </div>
    </div>
  );
}

export default EventCard;

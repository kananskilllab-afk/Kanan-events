import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

function Hero({ onOpenBooking, onOpenRegister, onOpenInvite }) {
    const [feat, setFeat] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/api/events/featured`)
            .then(res => { if (res.data.success) setFeat(res.data.data); })
            .catch(() => { });
    }, []);

    const makeRegisterData = (f) => ({
        title: f.title,
        venue: f.venue,
        date: `${f.dateDayStr} ${f.dateMonthStr} 2026`,
        time: f.time,
        invType: f.type,
        invCountries: (f.tags || []).map(t => t.label).join(' • '),
        invActivities: f.activities
    });

    return (
        <section className="hero">
            <div className="hero-pattern"></div>
            <div className="container">
                <div className="hero-inner">
                    <div>
                        <h1>Your <em>Study Abroad</em> Journey Starts Here</h1>
                        <p className="hero-sub">Explore our upcoming events for {feat ? `${feat.dateMonthStr} 2026` : '2026'}. Attend visa fairs, education expos, mock tests, and parent-teacher meets — in person or online.</p>
                        <div className="hero-btns" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px' }}>
                            <a href="#events" className="btn btn-orange btn-lg">Browse All Events</a>
                            <button className="btn btn-ghost btn-lg" onClick={onOpenBooking}>Book Free Counselling</button>
                        </div>
                        <div className="hero-stats">
                            <div><div className="h-stat-val">240K+</div><div className="h-stat-lbl">Students Served</div></div>
                            <div><div className="h-stat-val">37</div><div className="h-stat-lbl">Events in 2026</div></div>
                            <div><div className="h-stat-val">25+</div><div className="h-stat-lbl">Years Experience</div></div>
                        </div>
                    </div>

                    {/* Featured Event Card */}
                    {feat ? (
                        <div className="feat-card">
                            <div className="feat-badge">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                FEATURED EVENT
                            </div>
                            <h3>{feat.title}</h3>
                            <div className="feat-meta-row">
                                <span style={{ color: '#E53935' }}>📍</span> {feat.venue || 'All Branches'}
                                <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.3)' }}>|</span>
                                <span style={{ color: '#0052CC' }}>🗓️</span> {feat.dateDayStr} {feat.dateMonthStr} 2026
                            </div>
                            <div className="feat-meta-row">
                                10:00 AM – 7:00 PM &bull; Free Entry
                            </div>
                            <div className="feat-helpline">
                                📱 <span style={{ color: '#7B8599' }}>24x7:</span> +91 6356 568111
                            </div>
                            <button
                                className="feat-btn"
                                onClick={() => onOpenRegister(makeRegisterData(feat))}
                            >
                                Register Now — Free Entry
                            </button>
                            <button
                                onClick={() => onOpenInvite(makeRegisterData(feat))}
                                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', textDecoration: 'underline', width: '100%', marginTop: '14px', cursor: 'pointer' }}
                            >
                                Download Invitation Card
                            </button>
                        </div>
                    ) : (
                        /* Fallback card when no featured event is set */
                        <div className="feat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
                            <div style={{ textAlign: 'center', opacity: 0.5, color: '#fff' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📌</div>
                                <p style={{ fontSize: '14px' }}>No featured event set.<br />Mark one as featured in Admin.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Hero;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export function RegisterModal({ isOpen, onClose, eventDetails, onSuccess }) {
  const [studentType, setStudentType] = useState('kanan');
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', city: '',
    destination: '', educationLevel: '',
    kananId: '', referralSource: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        studentType,
        eventTitle: eventDetails?.title || 'Unknown Event'
      };
      await axios.post(`${API_BASE}/register`, payload);
      onSuccess(formData.name, studentType);
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please try again later.');
    }
  };

  return (
    <div className="modal-overlay active">
      <div className="modal">
        <div className="modal-head">
          <h3>Register for Event</h3>
          <button className="modal-x" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-event-box">
            <h4>{eventDetails?.title}</h4>
            <p>📍 {eventDetails?.venue}<br />📅 {eventDetails?.date} &nbsp;|&nbsp; ⏰ {eventDetails?.time}</p>
          </div>

          <div className="student-type-wrap">
            <span className="student-type-label">Are you a Kanan.co student? *</span>
            <div className="student-type-toggle">
              <div className={`stt-btn ${studentType === 'kanan' ? 'active' : ''}`} onClick={() => setStudentType('kanan')}>
                <div className="stt-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" /></svg></div>
                <span className="stt-title">Kanan Student</span>
              </div>
              <div className={`stt-btn ${studentType === 'outside' ? 'active' : ''}`} onClick={() => setStudentType('outside')}>
                <div className="stt-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /></svg></div>
                <span className="stt-title">Outside Student</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {studentType === 'kanan' && (
              <div className="form-group">
                <label>Kanan Student ID / File No.</label>
                <input type="text" name="kananId" placeholder="e.g. KN-2025-00412" onChange={handleChange} />
              </div>
            )}

            <div className="form-row">
              <div className="form-group"><label>Full Name *</label><input type="text" name="name" required onChange={handleChange} /></div>
              <div className="form-group"><label>Mobile *</label><input type="tel" name="mobile" required onChange={handleChange} /></div>
            </div>
            <div className="form-group"><label>Email *</label><input type="email" name="email" required onChange={handleChange} /></div>

            <div className="form-row">
              <div className="form-group">
                <label>Current City</label>
                <input type="text" name="city" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Interested In</label>
                <select name="destination" onChange={handleChange}>
                  <option value="">Select destination</option>
                  <option>Canada</option><option>UK</option><option>USA</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Current Education Level</label>
              <select name="educationLevel" onChange={handleChange}>
                <option value="">Select level</option>
                <option>12th / HSC</option><option>Bachelor's Degree</option><option>Master's Degree</option>
              </select>
            </div>

            {studentType === 'outside' && (
              <div className="form-group">
                <label>How did you hear about us?</label>
                <select name="referralSource" onChange={handleChange}>
                  <option value="">Select source</option>
                  <option>Social Media</option>
                  <option>Google Search</option>
                  <option>Friend or Family</option>
                </select>
              </div>
            )}

            <div className="form-submit"><button type="submit" className="btn btn-orange btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Confirm Registration</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function CallbackModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', interest: '' });
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:5000/api/interests')
        .then(res => { if (res.data.success) setInterests(res.data.data); })
        .catch(() => { });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/callback`, formData);
      onSuccess();
    } catch {
      alert('Failed to request callback. Try again.');
    }
  };

  return (
    <div className="modal-overlay active">
      <div className="modal" style={{ maxWidth: '440px' }}>
        <div className="modal-head">
          <h3>Request Callback</h3>
          <button className="modal-x" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--k-ink-soft)', marginBottom: '20px', fontSize: '14px' }}>Our expert counsellor will reach out within 24 hours.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Full Name *</label><input type="text" name="name" required onChange={handleChange} /></div>
            <div className="form-group"><label>Mobile *</label><input type="tel" name="mobile" required onChange={handleChange} /></div>
            <div className="form-group"><label>Email *</label><input type="email" name="email" required onChange={handleChange} /></div>
            <div className="form-group">
              <label>I'm interested in</label>
              <select name="interest" onChange={handleChange}>
                <option value="">Select your interest</option>
                {interests.map(opt => (
                  <option key={opt.id} value={opt.label}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="form-submit"><button type="submit" className="btn btn-orange btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Request Callback</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}


export function SuccessModal({ isOpen, onClose, title, message, showInviteBtn, onOpenInvite }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal" style={{ maxWidth: '420px' }}>
        <div className="success-body">
          <div className="success-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00B368" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg></div>
          <h3>{title}</h3>
          <p dangerouslySetInnerHTML={{ __html: message }}></p>
          <div className="success-actions">
            <button className="btn btn-primary btn-lg" onClick={onClose}>Done</button>
            {showInviteBtn && (
              <button className="btn btn-invite-success" onClick={() => { onClose(); onOpenInvite(); }} style={{ display: 'inline-flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download Invitation Card
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

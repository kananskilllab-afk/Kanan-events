import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

function shadeColor(hex, percent) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.min(255, Math.max(0, r + Math.round(r * percent / 100)));
    g = Math.min(255, Math.max(0, g + Math.round(g * percent / 100)));
    b = Math.min(255, Math.max(0, b + Math.round(b * percent / 100)));
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function rr(ctx, x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
}

function drawVcard(canvas, L) {
    const W = 600, H = 960;

    // Only use a custom image if it's a valid base64 data URL
    // (old DB records may have broken /uploads/... paths — ignore those)
    if (L.vcard_image && L.vcard_image.startsWith('data:')) {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);
        };
        img.onerror = () => {
            console.error('Failed to load custom vcard image, falling back to auto-gen');
            drawAutoGenVcard(canvas, L, W, H);
        };
        img.src = L.vcard_image;
        return;
    }

    drawAutoGenVcard(canvas, L, W, H);
}

function drawAutoGenVcard(canvas, L, W, H) {
    const ctx = canvas.getContext('2d');
    canvas.width = W; canvas.height = H;
    const accent = L.color || '#0052CC';

    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(0, 0, W, H);

    // Left bar
    const barGrad = ctx.createLinearGradient(0, 0, 0, H);
    barGrad.addColorStop(0, accent); barGrad.addColorStop(1, shadeColor(accent, -30));
    ctx.fillStyle = barGrad; ctx.fillRect(0, 0, 6, H);

    // Header
    const headGrad = ctx.createLinearGradient(0, 0, W, 0);
    headGrad.addColorStop(0, accent); headGrad.addColorStop(1, shadeColor(accent, 30));
    ctx.fillStyle = headGrad; rr(ctx, 0, 0, W, 140, 0, true);

    // Dots
    ctx.globalAlpha = 0.08;
    for (let dx = 0; dx < W; dx += 20) for (let dy = 0; dy < 140; dy += 20) { ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); }
    ctx.globalAlpha = 1;

    // Logo K
    ctx.fillStyle = '#fff'; rr(ctx, 30, 30, 48, 48, 12, true);
    ctx.fillStyle = accent; ctx.font = 'bold 28px Sora,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('K', 54, 63);
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Sora,sans-serif'; ctx.fillText('Kanan', 90, 56);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('.co', 90 + ctx.measureText('Kanan').width, 56);
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '13px "Plus Jakarta Sans",sans-serif'; ctx.fillText("Let's Grow Globally", 90, 76);
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.font = '12px "Plus Jakarta Sans",sans-serif';
    ctx.fillText('Est. 2001', W - 30, 52); ctx.fillText('Study Abroad Experts', W - 30, 70);

    // Avatar
    const avX = W / 2, avY = 190, avR = 62;
    ctx.beginPath(); ctx.arc(avX, avY, avR + 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.1)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 4; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.beginPath(); ctx.arc(avX, avY, avR + 3, 0, Math.PI * 2);
    ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.stroke();
    const avGrad = ctx.createLinearGradient(avX - avR, avY - avR, avX + avR, avY + avR);
    avGrad.addColorStop(0, accent); avGrad.addColorStop(1, shadeColor(accent, -20));
    ctx.beginPath(); ctx.arc(avX, avY, avR, 0, Math.PI * 2); ctx.fillStyle = avGrad; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 36px Sora,sans-serif'; ctx.fillText(L.initials, avX, avY + 13);

    // Name
    ctx.fillStyle = '#0B1223'; ctx.font = 'bold 30px Sora,sans-serif'; ctx.fillText(L.name, W / 2, 295);

    // Designation badge
    ctx.font = 'bold 14px "Plus Jakarta Sans",sans-serif';
    const desigText = (L.designation || '').toUpperCase();
    const desigW = ctx.measureText(desigText).width + 40;
    ctx.fillStyle = accent; rr(ctx, (W - desigW) / 2, 312, desigW, 32, 16, true);
    ctx.fillStyle = '#fff'; ctx.fillText(desigText, W / 2, 333);

    // Department
    ctx.fillStyle = '#7B8599'; ctx.font = '15px "Plus Jakarta Sans",sans-serif'; ctx.fillText(L.department || '', W / 2, 370);

    // Divider
    ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(50, 400); ctx.lineTo(W - 50, 400); ctx.stroke();

    // Contact rows
    const iconX = 60, textX = 108;
    const rows = [
        { icon: '📞', label: 'PHONE', value: L.phone || '' },
        { icon: '✉️', label: 'EMAIL', value: L.email || '' },
        { icon: '🌐', label: 'WEBSITE', value: 'Kanan.co' },
        { icon: '📍', label: 'OFFICE', value: L.branch || '' }
    ];
    rows.forEach((r, i) => {
        const ry = 430 + i * 58;
        if (i % 2 === 0) { ctx.fillStyle = 'rgba(0,0,0,.015)'; rr(ctx, 30, ry - 12, W - 60, 56, 10, true); }
        ctx.beginPath(); ctx.arc(iconX, ry + 10, 18, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.05)'; ctx.fill();
        ctx.font = '18px serif'; ctx.textAlign = 'center'; ctx.fillText(r.icon, iconX, ry + 17);
        ctx.textAlign = 'left'; ctx.fillStyle = '#A0AEC0'; ctx.font = 'bold 10px "Plus Jakarta Sans",sans-serif'; ctx.fillText(r.label, textX, ry - 2);
        ctx.fillStyle = '#1A202C'; ctx.font = '600 14px "Plus Jakarta Sans",sans-serif';
        const maxW = W - textX - 40;
        if (ctx.measureText(r.value).width > maxW) {
            const words = r.value.split(/[\s,]+/); let l1 = '', l2 = '';
            for (const w of words) { const t = l1 + (l1 ? ' ' : '') + w; if (ctx.measureText(t).width > maxW && l1) { l2 += (l2 ? ' ' : '') + w; } else { l1 = t; } }
            ctx.font = '600 12px "Plus Jakarta Sans",sans-serif'; ctx.fillText(l1, textX, ry + 14); if (l2) ctx.fillText(l2, textX, ry + 30);
        } else { ctx.fillText(r.value, textX, ry + 18); }
    });

    // Bottom banner
    const bannerY = H - 130;
    const banGrad = ctx.createLinearGradient(0, bannerY, W, bannerY);
    banGrad.addColorStop(0, accent); banGrad.addColorStop(1, shadeColor(accent, 25));
    ctx.fillStyle = banGrad; rr(ctx, 30, bannerY, W - 60, 100, 16, true);
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Sora,sans-serif'; ctx.fillText('Connect with us', 56, bannerY + 34);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '12px "Plus Jakarta Sans",sans-serif';
    ctx.fillText('📞 +91 265 235 4400', 56, bannerY + 54);
    ctx.fillText('🌐 www.kanan.co', 56, bannerY + 72);

    // Footer stats
    ctx.fillStyle = '#A0AEC0'; ctx.font = '11px "Plus Jakarta Sans",sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('2,40,000+ Students  •  25+ Years  •  30+ Countries  •  98% Visa Success', W / 2, H - 14);
}

export function VcardModal({ isOpen, onClose, leaderName }) {
    const canvasRef = useRef(null);
    const [leader, setLeader] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && leaderName) {
            setLoading(true);
            axios.get(`${API_URL}/api/hods`)
                .then(res => {
                    if (res.data.success) {
                        // Find by exact name or closest partial match
                        const found = res.data.data.find(h => h.name.toLowerCase() === leaderName.toLowerCase())
                            || res.data.data.find(h => leaderName.toLowerCase().includes(h.name.toLowerCase().split(' ')[0].toLowerCase()));
                        setLeader(found || null);
                    }
                })
                .catch(() => setLeader(null))
                .finally(() => setLoading(false));
        }
    }, [isOpen, leaderName]);

    useEffect(() => {
        if (isOpen && leader && canvasRef.current) {
            drawVcard(canvasRef.current, leader);
        }
    }, [isOpen, leader]);

    if (!isOpen) return null;

    if (loading) return (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal vcard-modal-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ textAlign: 'center', color: 'var(--k-ink-muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                    <p>Loading HOD card...</p>
                </div>
            </div>
        </div>
    );

    if (!leader) return (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal vcard-modal-inner" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>👤</div>
                <h3 style={{ fontFamily: "'Sora',sans-serif", marginBottom: '8px' }}>HOD not found</h3>
                <p style={{ color: 'var(--k-ink-muted)', fontSize: '13px', marginBottom: '20px' }}>"{leaderName}" is not in the HODs database.<br />Add them in Admin → Manage HODs.</p>
                <button className="btn btn-primary" onClick={onClose}>Close</button>
            </div>
        </div>
    );

    const phoneClean = (leader.phone || '').replace(/[^0-9+]/g, '');

    const download = async () => {
        if (leader.vcard_image) {
            try {
                let blob;
                if (leader.vcard_image.startsWith('data:')) {
                    // Base64 data URL — convert to blob directly
                    const res = await fetch(leader.vcard_image);
                    blob = await res.blob();
                } else {
                    // Legacy path — fetch from API
                    const res = await fetch(`${API_URL}${leader.vcard_image}`);
                    blob = await res.blob();
                }
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `kanan-${leader.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-card`;
                document.body.appendChild(link); link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading vcard image', error);
                alert('Could not download image.');
            }
        } else {
            const link = document.createElement('a');
            link.download = `kanan-${leader.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-card.png`;
            link.href = canvasRef.current.toDataURL('image/png', 1.0);
            link.click();
        }
    };

    return (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal vcard-modal-inner">
                <div className="modal-head">
                    <h3>👤 Team Leader Card</h3>
                    <button className="modal-x" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="vcard-preview-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
                        {(leader.vcard_image && leader.vcard_image.startsWith('data:')) ? (
                            <img
                                src={leader.vcard_image}
                                alt={`${leader.name} Visiting Card`}
                                style={{ width: '100%', maxWidth: '100%', display: 'block', borderRadius: '14px', objectFit: 'contain' }}
                            />
                        ) : (
                            <canvas ref={canvasRef} className="vcard-canvas" style={{ width: '100%', display: 'block', borderRadius: '14px' }} />
                        )}
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={download}>⬇ Save Card</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VcardModal;


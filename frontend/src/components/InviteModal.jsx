import React, { useEffect, useRef } from 'react';
import logoImgSrc from '../assets/logo.png';

export function InviteModal({ isOpen, onClose, inviteData }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (isOpen && inviteData && canvasRef.current) {
            const img = new Image();
            img.src = logoImgSrc;
            img.onload = () => generateInviteCard(canvasRef.current, inviteData, img);
            img.onerror = () => generateInviteCard(canvasRef.current, inviteData, null);
        }
    }, [isOpen, inviteData]);

    if (!isOpen || !inviteData) return null;

    const downloadInvite = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        const safeName = inviteData.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        link.download = `kanan-invite-${safeName}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    };

    const shareInviteWhatsApp = () => {
        const text = encodeURIComponent(
            `🎓 You're Invited!\\n\\n` +
            `*${inviteData.title}*\\n` +
            `📅 ${inviteData.date}\\n` +
            `⏰ ${inviteData.time}\\n` +
            `📍 ${inviteData.venue}\\n\\n` +
            `✨ FREE ENTRY — Register now!\\n` +
            `🌐 www.kanan.co/events\\n` +
            `📞 +91 265 235 4400\\n\\n` +
            `Kanan International — 25+ Years of Study Abroad Excellence`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div className="modal-overlay active">
            <div className="modal invite-modal-inner">
                <div className="modal-head">
                    <h3>🎟️ Your Event Invitation</h3>
                    <button className="modal-x" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                </div>
                <div className="modal-body">
                    <div className="invite-preview-wrap">
                        <canvas ref={canvasRef} className="invite-canvas" width="1080" height="1350"></canvas>
                    </div>
                    <div className="invite-actions">
                        <button className="btn btn-orange btn-lg" onClick={downloadInvite}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Download PNG
                        </button>
                        <button className="btn btn-primary btn-lg" onClick={shareInviteWhatsApp}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            Share WhatsApp
                        </button>
                    </div>
                    <p className="invite-note">📲 Download and share this beautiful invitation with friends & family!</p>
                </div>
            </div>
        </div>
    );
}

// Completely Revamped Premium Canvas Design
function generateInviteCard(canvas, inviteData, logoImg) {
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1450;
    canvas.width = W; canvas.height = H;

    // --- Modern Mesh Gradient Background ---
    const themes = {
        'visa-fair': { bg: '#060B19', glow1: '#0047FF', glow2: '#FF3366', accent: '#00E5FF', label: 'VISA FAIR' },
        'education-expo': { bg: '#050A0F', glow1: '#7000FF', glow2: '#00D68F', accent: '#00FFC2', label: 'EDUCATION EXPO' },
        'ptm': { bg: '#0A0F0D', glow1: '#008F55', glow2: '#2563EB', accent: '#60A5FA', label: 'MEETUP' },
        'mock-test': { bg: '#140A05', glow1: '#E53935', glow2: '#FF9800', accent: '#FFD54F', label: 'MOCK TEST' },
        'seminar': { bg: '#050D19', glow1: '#2563EB', glow2: '#00D68F', accent: '#38BDF8', label: 'SEMINAR' }
    };
    const t = themes[inviteData.type] || themes['education-expo'];

    // Deep Dark Base
    ctx.fillStyle = t.bg; ctx.fillRect(0, 0, W, H);

    // Glowing Ambient Orbs (Simulated Blur)
    const drawAmbientGlow = (x, y, r, color, maxAlpha) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, color); grad.addColorStop(1, 'transparent');
        ctx.globalAlpha = maxAlpha; ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    };
    drawAmbientGlow(W * 0.2, H * 0.2, 800, t.glow1, 0.4);
    drawAmbientGlow(W * 0.8, H * 0.6, 900, t.glow2, 0.3);
    drawAmbientGlow(W * 0.5, H * 1.0, 600, t.glow1, 0.2);

    // Subtle Grid Overlay Pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 60) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
    for (let i = 0; i < H; i += 60) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

    // --- Top Header ---
    if (logoImg) {
        const ratio = logoImg.width / logoImg.height;
        const logoH = 34; const logoW = logoH * ratio;
        ctx.globalAlpha = 1;
        ctx.drawImage(logoImg, 60, 60, logoW, logoH);
    } else {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 28px Sora, sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Kanan.co', 60, 84);
    }

    // Top Right Ribbon
    ctx.fillStyle = t.accent;
    ctx.beginPath(); ctx.moveTo(W - 180, 0); ctx.lineTo(W - 120, 0); ctx.lineTo(W, 120); ctx.lineTo(W, 180); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(W - 85, 85); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#000'; ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif'; ctx.textAlign = 'center'; ctx.letterSpacing = '4px'; ctx.fillText('PREMIUM', 0, 0);
    ctx.restore();

    // --- Main Glassmorphic Panel ---
    const panelX = 60, panelY = 160, panelW = W - 120, panelH = H - 380;

    // Panel Shadow & Base
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30;
    ctx.fillStyle = 'rgba(15, 20, 35, 0.7)'; // Frosted dark glass
    roundRect(ctx, panelX, panelY, panelW, panelH, 32, true);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    // Panel Inner Glow / Border
    const panelGrad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
    panelGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    panelGrad.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
    ctx.strokeStyle = panelGrad; ctx.lineWidth = 1.5;
    roundRect(ctx, panelX, panelY, panelW, panelH, 32, false); ctx.stroke();

    // --- Inside Panel Content ---

    // 1. "YOU'RE INVITED TO" Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'; roundRect(ctx, panelX + 50, panelY + 50, 300, 36, 18, true);
    ctx.fillStyle = t.accent; ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif'; ctx.textAlign = 'center'; ctx.letterSpacing = '4px';
    ctx.fillText("✦  YOU'RE INVITED TO", panelX + 200, panelY + 73);

    // 2. Large Typography Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff'; ctx.font = 'bold 64px Sora, sans-serif'; ctx.letterSpacing = '-1px';
    const titleLines = wrapText(ctx, inviteData.title, panelX + 50, panelY + 160, panelW - 100, 76);
    const contentStartY = panelY + 160 + (titleLines * 76);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(panelX + 50, contentStartY); ctx.lineTo(panelX + panelW - 50, contentStartY); ctx.stroke();

    // 3. Event Details Grid (Date, Time, Venue)
    const dtY = contentStartY + 40;

    // Date Parsing
    const dateParts = inviteData.date.split(','); const dateMain = dateParts[0].trim();
    const dateMatch = dateMain.match(/\d{1,2}/); const dateNum = dateMatch ? dateMatch[0] : '06';
    const monthMatch = dateMain.match(/[a-zA-Z]+/); const dateMonth = monthMatch ? monthMatch[0].toUpperCase().substring(0, 3) : 'MAR';

    // Left Column: Big Date Block
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; roundRect(ctx, panelX + 50, dtY, 140, 140, 20, true);
    ctx.fillStyle = t.accent; ctx.textAlign = 'center'; ctx.font = 'bold 58px Sora, sans-serif'; ctx.fillText(dateNum, panelX + 120, dtY + 75);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '4px'; ctx.fillText(dateMonth, panelX + 120, dtY + 110);

    // Right Column: Details
    const detailX = panelX + 230;
    ctx.textAlign = 'left';

    // Time
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '600 14px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '2px'; ctx.fillText('TIME', detailX, dtY + 25);
    ctx.fillStyle = '#fff'; ctx.font = '600 24px "Plus Jakarta Sans", sans-serif'; ctx.fillText(inviteData.time, detailX, dtY + 55);

    // Location
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '600 14px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '2px'; ctx.fillText('LOCATION', detailX, dtY + 105);
    ctx.fillStyle = '#fff'; ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    const vLines = wrapText(ctx, inviteData.venue, detailX, dtY + 135, panelW - 300, 34);

    // Divider Line 2
    const d2Y = dtY + 180;
    ctx.beginPath(); ctx.moveTo(panelX + 50, d2Y); ctx.lineTo(panelX + panelW - 50, d2Y); ctx.stroke();

    // 4. Countries & Features Section
    const curY = d2Y + 40;

    if (inviteData.countries) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '600 14px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '2px'; ctx.textAlign = 'left'; ctx.fillText('DESTINATIONS:', panelX + 50, curY);
        let cx = panelX + 220;
        const countryList = inviteData.countries.split(' • ');
        countryList.forEach((c) => {
            const tw = ctx.measureText(c).width + 30;
            ctx.fillStyle = 'rgba(255,255,255,0.1)'; roundRect(ctx, cx, curY - 20, tw, 36, 18, true);
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; roundRect(ctx, cx, curY - 20, tw, 36, 18, false); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '1px'; ctx.textAlign = 'center'; ctx.fillText(c, cx + tw / 2, curY + 4);
            cx += tw + 12;
            if (cx > panelX + panelW - 50) { cx = panelX + 220; } // lazy wrap prevention
        });
    }

    if (inviteData.activities) {
        const actY = curY + 60;
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.textAlign = 'left'; ctx.fillText('HIGHLIGHTS:', panelX + 50, actY);
        const actList = inviteData.activities.split(' • '); let row = 0; let col = 0;
        actList.forEach((act) => {
            const ax = panelX + 220 + (col * 320); const ay = actY - 14 + (row * 36);
            ctx.fillStyle = t.accent; ctx.beginPath(); ctx.arc(ax, ay - 5, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✓', ax, ay - 2);
            ctx.fillStyle = '#fff'; ctx.font = '500 16px "Plus Jakarta Sans", sans-serif'; ctx.textAlign = 'left'; ctx.fillText(act, ax + 18, ay + 1);
            col++; if (col > 1) { col = 0; row++; }
        });
    }

    // 5. Huge Event Category Watermark Graphic inside Panel Bottom Right
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.font = '900 140px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '-4px';
    ctx.fillText(t.label.split(' ')[0], panelX + panelW - 20, panelY + panelH - 30);

    // Free Entry VIP Badge
    ctx.fillStyle = 'rgba(0, 255, 170, 0.1)'; let greenGrad = ctx.createLinearGradient(0, panelY + panelH - 80, 0, panelY + panelH);
    ctx.strokeStyle = '#00FFC2'; ctx.lineWidth = 1.5;
    roundRect(ctx, panelX + 50, panelY + panelH - 80, 200, 44, 22, true);
    ctx.setLineDash([8, 4]); roundRect(ctx, panelX + 50, panelY + panelH - 80, 200, 44, 22, false); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#00FFC2'; ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif'; ctx.textAlign = 'center'; ctx.letterSpacing = '3px';
    ctx.fillText('✦ VIP ENTRY ✦', panelX + 150, panelY + panelH - 52);


    // --- Bottom Footer Area (Outside the Glass Panel) ---
    const footY = panelY + panelH + 50;

    // Contact Blocks
    const cWidth = W / 3;

    // Web
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '600 14px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '3px'; ctx.fillText('WEBSITE', cWidth * 0.5, footY);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '2px'; ctx.fillText('www.kanan.co', cWidth * 0.5, footY + 36);

    // Separator
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(cWidth - 1, footY - 10, 2, 50);

    // Phone
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '600 14px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '3px'; ctx.fillText('HELPLINE 24x7', cWidth * 1.5, footY);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '2px'; ctx.fillText('+91 6356 568111', cWidth * 1.5, footY + 36);

    // Separator
    ctx.fillRect(cWidth * 2 - 1, footY - 10, 2, 50);

    // Scan Label
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '600 14px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '3px'; ctx.fillText('DIGITAL TICKET', cWidth * 2.5, footY);

    // Cool QR Graphic
    const qrSize = 60; const qrX = (cWidth * 2.5) - (qrSize / 2); const qrY = footY + 15;
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; roundRect(ctx, qrX, qrY, qrSize, qrSize, 8, true);
    ctx.fillStyle = '#fff';
    for (let gx = 0; gx < 6; gx++) { for (let gy = 0; gy < 6; gy++) { if (Math.random() > 0.3) { ctx.fillRect(qrX + 6 + gx * 8.5, qrY + 6 + gy * 8.5, 6, 6); } } }


    // Very Bottom Brand Bar
    ctx.fillStyle = '#000'; ctx.fillRect(0, H - 70, W, 70);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '600 15px "Plus Jakarta Sans", sans-serif'; ctx.letterSpacing = '2px';
    ctx.fillText('VADODARA    ·    CHENNAI    ·    TORONTO    ·    SURAT    ·    VALLABH VIDYANAGAR', W / 2, H - 30);
}

function roundRect(ctx, x, y, w, h, r, fill) {
    if (typeof r === 'number') { r = { tl: r, tr: r, br: r, bl: r }; }
    ctx.beginPath(); ctx.moveTo(x + r.tl, y); ctx.lineTo(x + w - r.tr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    ctx.lineTo(x + w, y + h - r.br); ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h); ctx.lineTo(x + r.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl); ctx.lineTo(x, y + r.tl); ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath(); if (fill) { ctx.fill(); }
}

function wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' '); let line = ''; let lines = [];
    words.forEach(w => {
        const test = line + (line ? ' ' : '') + w;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else { line = test; }
    });
    if (line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH)); return lines.length;
}

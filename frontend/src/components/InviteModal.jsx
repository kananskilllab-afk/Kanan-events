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

// Premium White / Light Elegant Canvas Design
function generateInviteCard(canvas, inviteData, logoImg) {
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1450;
    canvas.width = W; canvas.height = H;

    const themes = {
        'visa-fair': { accent: '#0052CC', light: '#E8F1FF', gold: '#D4A017', label: 'VISA FAIR' },
        'education-expo': { accent: '#6200EA', light: '#F3E8FF', gold: '#C89B3C', label: 'EDUCATION EXPO' },
        'ptm': { accent: '#00695C', light: '#E0F7F4', gold: '#B8860B', label: 'PARENT MEET' },
        'mock-test': { accent: '#C62828', light: '#FFEBEE', gold: '#D4A017', label: 'MOCK TEST' },
        'seminar': { accent: '#1565C0', light: '#E3EEFF', gold: '#B8860B', label: 'SEMINAR' },
    };
    const t = themes[inviteData.type] || themes['education-expo'];

    // ── WHITE BASE ────────────────────────────────────────────────────────────
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Very subtle warm off-white tint towards bottom
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, 'rgba(255,255,255,1)');
    bgGrad.addColorStop(1, 'rgba(245,247,252,1)');
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

    // ── TOP ACCENT BAR ────────────────────────────────────────────────────────
    ctx.fillStyle = t.accent;
    ctx.fillRect(0, 0, W, 14);

    // Gold thin inner line
    ctx.fillStyle = t.gold;
    ctx.fillRect(0, 14, W, 4);

    // ── HEADER AREA ──────────────────────────────────────────────────────────
    // Logo
    if (logoImg) {
        const ratio = logoImg.width / logoImg.height;
        const logoH = 40; const logoW = logoH * ratio;
        ctx.drawImage(logoImg, 70, 48, logoW, logoH);
    } else {
        ctx.fillStyle = t.accent;
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Kanan.co', 70, 82);
    }

    // "INVITATION" label top right
    ctx.fillStyle = t.accent;
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '5px';
    ctx.textAlign = 'right';
    ctx.fillText('INVITATION', W - 70, 72);

    // Gold accent line under header
    ctx.strokeStyle = t.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(70, 108); ctx.lineTo(W - 70, 108); ctx.stroke();

    // ── MAIN CARD PANEL ───────────────────────────────────────────────────────
    const pX = 70, pY = 130, pW = W - 140, pH = H - 290;

    // Card shadow
    ctx.shadowColor = 'rgba(0,0,50,0.08)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, pX, pY, pW, pH, 24, true);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.shadowColor = 'transparent';

    // Card border
    ctx.strokeStyle = 'rgba(0,0,80,0.08)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, pX, pY, pW, pH, 24, false); ctx.stroke();

    // Accent colour left edge stripe
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.moveTo(pX, pY + 24);
    ctx.lineTo(pX, pY + pH - 24);
    ctx.quadraticCurveTo(pX, pY + pH, pX + 24, pY + pH);
    ctx.lineTo(pX + 10, pY + pH);
    ctx.quadraticCurveTo(pX, pY + pH, pX, pY + pH - 24);
    ctx.moveTo(pX, pY + 24);
    ctx.quadraticCurveTo(pX, pY, pX + 24, pY);
    ctx.lineTo(pX + 10, pY);
    ctx.quadraticCurveTo(pX, pY, pX, pY + 24);
    ctx.fillRect(pX, pY + 24, 10, pH - 48);

    // ── YOU'RE INVITED BADGE ──────────────────────────────────────────────────
    const badgeW = 280, badgeH = 38;
    const badgeX = pX + 50, badgeY = pY + 44;
    ctx.fillStyle = t.light;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 19, true);
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 1.2;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 19, false); ctx.stroke();
    ctx.fillStyle = t.accent;
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.textAlign = 'center';
    ctx.fillText("✦  YOU'RE INVITED  ✦", badgeX + badgeW / 2, badgeY + 25);

    // ── EVENT TITLE ────────────────────────────────────────────────────────────
    ctx.textAlign = 'left';
    ctx.letterSpacing = '-1px';
    ctx.fillStyle = '#0B1223';
    ctx.font = 'bold 62px "Plus Jakarta Sans", sans-serif';
    const titleLines = wrapText(ctx, inviteData.title, pX + 50, pY + 148, pW - 100, 74);
    const afterTitle = pY + 148 + (titleLines * 74);

    // Gold divider after title
    ctx.strokeStyle = t.gold;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pX + 50, afterTitle + 10); ctx.lineTo(pX + 50 + 80, afterTitle + 10); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pX + 50 + 90, afterTitle + 10); ctx.lineTo(pX + pW - 50, afterTitle + 10); ctx.stroke();

    // ── DATE / TIME / VENUE ────────────────────────────────────────────────────
    const dtY = afterTitle + 46;

    // Parse date
    const dateMain = (inviteData.date || '').split(',')[0].trim();
    const dateNum = (dateMain.match(/\d{1,2}/) || ['06'])[0];
    const dateMonth = ((dateMain.match(/[a-zA-Z]+/) || ['Mar'])[0]).toUpperCase().slice(0, 3);

    // Big date block
    ctx.fillStyle = t.accent;
    roundRect(ctx, pX + 50, dtY, 130, 130, 18, true);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 56px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '-2px';
    ctx.fillText(dateNum, pX + 115, dtY + 80);
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillText(dateMonth, pX + 115, dtY + 114);

    // Info rows
    const infoX = pX + 210;
    ctx.textAlign = 'left';

    // Time row
    ctx.fillStyle = '#7B8599';
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('TIME', infoX, dtY + 28);
    ctx.fillStyle = '#0B1223';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '0px';
    ctx.fillText(inviteData.time || '10:00 AM – 7:00 PM', infoX, dtY + 60);

    // Venue row
    ctx.fillStyle = '#7B8599';
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('VENUE', infoX, dtY + 100);
    ctx.fillStyle = '#0B1223';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '0px';
    wrapText(ctx, inviteData.venue || 'All Branches', infoX, dtY + 130, pW - 280, 30);

    // Thin separator
    const sep1Y = dtY + 168;
    ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pX + 50, sep1Y); ctx.lineTo(pX + pW - 50, sep1Y); ctx.stroke();

    // ── DESTINATIONS ────────────────────────────────────────────────────────────
    let rowY = sep1Y + 40;
    if (inviteData.countries) {
        ctx.fillStyle = '#7B8599';
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '3px';
        ctx.textAlign = 'left';
        ctx.fillText('DESTINATIONS', pX + 50, rowY);
        let cx = pX + 210;
        inviteData.countries.split(' • ').forEach(c => {
            ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
            ctx.letterSpacing = '0px';
            const tw = ctx.measureText(c).width + 28;
            ctx.fillStyle = t.light;
            roundRect(ctx, cx, rowY - 22, tw, 34, 17, true);
            ctx.strokeStyle = t.accent; ctx.lineWidth = 1.2;
            roundRect(ctx, cx, rowY - 22, tw, 34, 17, false); ctx.stroke();
            ctx.fillStyle = t.accent;
            ctx.textAlign = 'center';
            ctx.fillText(c, cx + tw / 2, rowY + 1);
            cx += tw + 10;
        });
        rowY += 54;
    }

    // ── ACTIVITIES / HIGHLIGHTS ──────────────────────────────────────────────
    if (inviteData.activities) {
        ctx.fillStyle = '#7B8599';
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '3px';
        ctx.textAlign = 'left';
        ctx.fillText('HIGHLIGHTS', pX + 50, rowY);
        const acts = inviteData.activities.split(' • ');
        let col = 0, row = 0;
        acts.forEach(act => {
            const ax = pX + 210 + col * 340;
            const ay = rowY - 14 + row * 36;
            // Gold bullet
            ctx.fillStyle = t.gold;
            ctx.beginPath(); ctx.arc(ax + 8, ay - 4, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✓', ax + 8, ay - 1);
            // text
            ctx.fillStyle = '#0B1223';
            ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
            ctx.letterSpacing = '0px';
            ctx.textAlign = 'left';
            ctx.fillText(act, ax + 22, ay + 2);
            col++; if (col > 1) { col = 0; row++; }
        });
        rowY += 46 + Math.ceil(acts.length / 2) * 36;
    }

    // ── FREE ENTRY BADGE ──────────────────────────────────────────────────────
    const badY = pY + pH - 74;
    ctx.fillStyle = '#E8F8EF';
    roundRect(ctx, pX + 50, badY, 220, 44, 22, true);
    ctx.strokeStyle = '#00B368'; ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 4]);
    roundRect(ctx, pX + 50, badY, 220, 44, 22, false); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#00875A';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.textAlign = 'center';
    ctx.fillText('✦ FREE ENTRY ✦', pX + 160, badY + 28);

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

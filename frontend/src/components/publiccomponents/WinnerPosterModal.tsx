import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Spin } from 'antd';
import { DownloadOutlined, TrophyFilled, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import posterBgSrc from '../../assets/posterbg.jpg';
import defaultDpSrc from '../../assets/dp.jpg';

interface WinnerPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: any;
  competition: any;
}

// Helper function to safely load image with timeout, cache check, and CORS support
const loadImage = (src: string, crossOrigin?: string, timeoutMs: number = 4000): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);

    const img = new Image();
    let timer: any = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      cleanup();
      resolve(img);
    };

    img.onerror = () => {
      cleanup();
      resolve(null);
    };

    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }

    timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    img.src = src;

    // If image is already cached in browser memory
    if (img.complete && img.naturalWidth > 0) {
      cleanup();
      resolve(img);
    }
  });
};

export const WinnerPosterModal: React.FC<WinnerPosterModalProps> = ({
  isOpen,
  onClose,
  winner,
  competition,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendering, setRendering] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const renderPoster = useCallback(async () => {
    if (!winner) return;

    setRendering(true);
    setRenderError(null);

    // Ensure canvas DOM ref is ready (retry if modal is animating into DOM)
    let canvas = canvasRef.current;
    if (!canvas) {
      await new Promise((res) => setTimeout(res, 60));
      canvas = canvasRef.current;
    }

    if (!canvas) {
      console.error('Canvas element ref not found');
      setRenderError('Canvas element initialization failed.');
      setRendering(false);
      return;
    }

    const CANVAS_WIDTH = 3750;
    const CANVAS_HEIGHT = 4688;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setRenderError('Canvas 2D context not available.');
      setRendering(false);
      return;
    }

    try {
      // 1. Load Background Image (posterbg.jpg - 1.0 MB optimized)
      const bgImg = await loadImage(posterBgSrc, undefined, 5000);
      
      // Clear canvas & draw background
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        bgGrad.addColorStop(0, '#1E293B');
        bgGrad.addColorStop(1, '#0F172A');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // 2. Extract Data
      const rankText = winner.rank ? `${winner.rank} RANK` : 'WINNER';
      const participantName = (winner.participant?.name || winner.name || 'WINNER').toUpperCase();
      const chestNo = winner.chestCode || winner.participant?.chestNo || '';
      
      const groupObj = winner.participant?.group || winner.group;
      const groupName = (groupObj?.name || (winner.participantType === 'Group' ? winner.participant?.name : '') || '').toUpperCase();
      const groupLogoUrl = groupObj?.logoUrl || groupObj?.logo || groupObj?.image || (winner.participantType === 'Group' ? (winner.participant?.logoUrl || winner.participant?.logo || winner.participant?.image) : null);

      const compName = (competition?.name || 'COMPETITION RESULT').toUpperCase();
      const compCategory = (competition?.category || '').toUpperCase();
      const compType = competition?.type === 'group' ? 'GROUP CHAMPIONSHIP EVENT' : 'INDIVIDUAL TALENT EVENT';
      const points = winner.pointsAwarded || 0;

      const isGroupItem = winner.participantType === 'Group' || competition?.type === 'group';

      // 3. Load Main Participant / Group Logo Image
      let mainImg: HTMLImageElement | null = null;

      if (isGroupItem) {
        // For group item: include group logo image if available (NEVER fallback to default DP photo)
        if (groupLogoUrl) {
          mainImg = await loadImage(groupLogoUrl, 'anonymous', 4000);
        }
      } else {
        // For student/individual item: load student profile image
        let studentImgUrl = winner.participant?.profileImage || winner.participant?.image || winner.participant?.avatarUrl || winner.participant?.photo;
        if (studentImgUrl) {
          mainImg = await loadImage(studentImgUrl, 'anonymous', 4000);
        }
        // Fallback to default DP photo ONLY for individual student items if missing
        if (!mainImg) {
          mainImg = await loadImage(defaultDpSrc, undefined, 4000);
        }
      }

      // Load Group Emblem Image for badge if available
      let groupLogoImg: HTMLImageElement | null = null;
      if (groupLogoUrl) {
        groupLogoImg = isGroupItem ? mainImg : await loadImage(groupLogoUrl, 'anonymous', 3000);
      }

      // 4. Draw Main Circle (Photo or Royal Golden Italic First Letter Logo)
      // Positioned lower to fill container naturally: X = 1875, Y = 1780
      const photoCenterX = 1875;
      const photoCenterY = 1780;
      const photoRadius = 450; // Radius = 450px (Diameter = 900px)

      ctx.save();
      // Drop Shadow for circular photo frame
      ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 18;

      // Gold Outer Ring
      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, photoRadius + 20, 0, Math.PI * 2);
      const goldGrad = ctx.createLinearGradient(photoCenterX - photoRadius, photoCenterY - photoRadius, photoCenterX + photoRadius, photoCenterY + photoRadius);
      goldGrad.addColorStop(0, '#F59E0B');
      goldGrad.addColorStop(0.5, '#FCD34D');
      goldGrad.addColorStop(1, '#D97706');
      ctx.fillStyle = goldGrad;
      ctx.fill();

      // White Inner Border
      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, photoRadius + 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Clip Path for Main Circle
      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Reset shadow for inner content
      ctx.shadowColor = 'transparent';

      if (mainImg && mainImg.width > 0 && mainImg.height > 0) {
        // Draw Image centered & cropped (cover style)
        const aspect = mainImg.width / mainImg.height;
        let drawW = photoRadius * 2;
        let drawH = photoRadius * 2;
        let drawX = photoCenterX - photoRadius;
        let drawY = photoCenterY - photoRadius;

        if (aspect > 1) {
          drawW = (photoRadius * 2) * aspect;
          drawX = photoCenterX - (drawW / 2);
        } else {
          drawH = (photoRadius * 2) / aspect;
          drawY = photoCenterY - (drawH / 2);
        }
        ctx.drawImage(mainImg, drawX, drawY, drawW, drawH);
      } else if (isGroupItem) {
        // For Group items without logo image: DO NOT use default DP!
        // Fill circle with rich radial slate/navy background
        const circleBg = ctx.createRadialGradient(photoCenterX, photoCenterY, 50, photoCenterX, photoCenterY, photoRadius);
        circleBg.addColorStop(0, '#1E293B');
        circleBg.addColorStop(0.7, '#0F172A');
        circleBg.addColorStop(1, '#020617');
        ctx.fillStyle = circleBg;
        ctx.fillRect(photoCenterX - photoRadius, photoCenterY - photoRadius, photoRadius * 2, photoRadius * 2);

        // Draw Royal Golden Italic First Letter Logo
        const groupInitial = (groupName || participantName || 'G').charAt(0).toUpperCase();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'italic 900 420px "Georgia", "Times New Roman", serif';

        const textGold = ctx.createLinearGradient(
          photoCenterX - 150,
          photoCenterY - 150,
          photoCenterX + 150,
          photoCenterY + 150
        );
        textGold.addColorStop(0, '#FDE68A');
        textGold.addColorStop(0.3, '#F59E0B');
        textGold.addColorStop(0.7, '#D97706');
        textGold.addColorStop(1, '#92400E');

        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 25;
        ctx.fillStyle = textGold;
        ctx.fillText(groupInitial, photoCenterX, photoCenterY + 20);
      }
      ctx.restore();

      // 5. Typography inside Light Area (Moved down to eliminate huge gap)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Congratulations Text (Increased font size & tracking)
      ctx.font = '900 68px "Inter", "Segoe UI", sans-serif';
      ctx.letterSpacing = '12px';
      ctx.fillStyle = '#D97706';
      ctx.fillText('C O N G R A T U L A T I O N S', photoCenterX, 2330);

      // Student Name (Dynamic Font Size fitting)
      let nameFontSize = 110;
      ctx.font = `900 ${nameFontSize}px "Georgia", "Times New Roman", serif`;
      while (ctx.measureText(participantName).width > 1750 && nameFontSize > 55) {
        nameFontSize -= 4;
        ctx.font = `900 ${nameFontSize}px "Georgia", "Times New Roman", serif`;
      }
      ctx.fillStyle = '#0F172A';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(participantName, photoCenterX, 2480);
      ctx.shadowColor = 'transparent';

      // Rank Pill Badge (e.g. 1st RANK WINNER)
      const rankBadgeY = 2630;
      const rankBadgeText = `🏆  ${rankText} WINNER  🏆`;
      ctx.font = '900 54px "Inter", sans-serif';
      const rankMetrics = ctx.measureText(rankBadgeText);
      const badgeW = rankMetrics.width + 130;
      const badgeH = 100;
      const badgeX = photoCenterX - badgeW / 2;

      // Draw Badge Container (Gradient)
      let badgeGrad = ctx.createLinearGradient(badgeX, rankBadgeY, badgeX + badgeW, rankBadgeY + badgeH);
      if (winner.rank === '1st') {
        badgeGrad.addColorStop(0, '#D97706');
        badgeGrad.addColorStop(0.5, '#F59E0B');
        badgeGrad.addColorStop(1, '#B45309');
      } else if (winner.rank === '2nd') {
        badgeGrad.addColorStop(0, '#475569');
        badgeGrad.addColorStop(0.5, '#94A3B8');
        badgeGrad.addColorStop(1, '#334155');
      } else if (winner.rank === '3rd') {
        badgeGrad.addColorStop(0, '#7C2D12');
        badgeGrad.addColorStop(0.5, '#9A3412');
        badgeGrad.addColorStop(1, '#451A03');
      } else {
        badgeGrad.addColorStop(0, '#0284C7');
        badgeGrad.addColorStop(1, '#0369A1');
      }

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      ctx.beginPath();
      ctx.roundRect(badgeX, rankBadgeY - badgeH / 2, badgeW, badgeH, 50);
      ctx.fillStyle = badgeGrad;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(rankBadgeText, photoCenterX, rankBadgeY + 4);

      // Chest Code & House Subtitle
      const infoY = 2770;
      const infoParts: string[] = [];
      if (chestNo) infoParts.push(`CHEST CODE: ${chestNo}`);
      if (groupName) infoParts.push(`HOUSE: ${groupName}`);

      if (infoParts.length > 0) {
        ctx.font = '800 50px "Inter", sans-serif';
        ctx.fillStyle = '#334155';
        ctx.letterSpacing = '2px';
        ctx.fillText(infoParts.join('   •   '), photoCenterX, infoY);
      }

      // Group Emblem Badge (If group exists, draw group logo or Royal Gold Italic First Letter)
      if (groupName) {
        const emblemY = 2890;
        const emblemRadius = 55;
        const emblemCenterX = photoCenterX;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 4;

        // Outer Gold Ring for Group Emblem
        ctx.beginPath();
        ctx.arc(emblemCenterX, emblemY, emblemRadius + 5, 0, Math.PI * 2);
        const emblemGold = ctx.createLinearGradient(emblemCenterX - emblemRadius, emblemY - emblemRadius, emblemCenterX + emblemRadius, emblemY + emblemRadius);
        emblemGold.addColorStop(0, '#F59E0B');
        emblemGold.addColorStop(1, '#D97706');
        ctx.fillStyle = emblemGold;
        ctx.fill();

        // Inner White Background Circle
        ctx.beginPath();
        ctx.arc(emblemCenterX, emblemY, emblemRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.restore();

        if (groupLogoImg && groupLogoImg.width > 0 && groupLogoImg.height > 0) {
          // Draw Group Logo Image clipped inside circle
          ctx.save();
          ctx.beginPath();
          ctx.arc(emblemCenterX, emblemY, emblemRadius - 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(groupLogoImg, emblemCenterX - emblemRadius, emblemY - emblemRadius, emblemRadius * 2, emblemRadius * 2);
          ctx.restore();
        } else {
          // Draw Royal Gold Italic First Letter of Group Name
          const firstLetter = groupName.charAt(0).toUpperCase() || 'G';
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'italic 900 62px "Georgia", "Times New Roman", serif';
          const textGold = ctx.createLinearGradient(emblemCenterX - 20, emblemY - 20, emblemCenterX + 20, emblemY + 20);
          textGold.addColorStop(0, '#D97706');
          textGold.addColorStop(1, '#B45309');
          ctx.fillStyle = textGold;
          ctx.fillText(firstLetter, emblemCenterX, emblemY + 3);
          ctx.restore();
        }
      }

      // 6. Typography in Dark Ambient Area (Y: 3200+)

      // Competition Name (Big Glow Accent)
      let compFontSize = 104;
      ctx.font = `900 ${compFontSize}px "Georgia", "Times New Roman", serif`;
      while (ctx.measureText(compName).width > 2200 && compFontSize > 55) {
        compFontSize -= 4;
        ctx.font = `900 ${compFontSize}px "Georgia", "Times New Roman", serif`;
      }

      const compY = 3280;
      ctx.save();
      ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
      ctx.shadowBlur = 35;
      
      const compGrad = ctx.createLinearGradient(photoCenterX - 600, compY, photoCenterX + 600, compY);
      compGrad.addColorStop(0, '#FEF3C7');
      compGrad.addColorStop(0.5, '#F59E0B');
      compGrad.addColorStop(1, '#FDE68A');
      ctx.fillStyle = compGrad;
      ctx.fillText(compName, photoCenterX, compY);
      ctx.restore();

      // Category & Event Type Subtitle
      const catText = [compCategory, compType].filter(Boolean).join('  |  ');
      if (catText) {
        ctx.font = '800 46px "Inter", sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.letterSpacing = '4px';
        ctx.fillText(catText, photoCenterX, compY + 105);
      }

      // Points Awarded Tag Box (if points > 0)
      if (points > 0) {
        const ptsY = 3530;
        const ptsText = `+${points} POINTS AWARDED`;
        ctx.font = '900 48px "Inter", sans-serif';
        const ptsMetrics = ctx.measureText(ptsText);
        const ptsW = ptsMetrics.width + 90;
        const ptsH = 84;

        ctx.save();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 4;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
        ctx.beginPath();
        ctx.roundRect(photoCenterX - ptsW / 2, ptsY - ptsH / 2, ptsW, ptsH, 20);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#FCD34D';
        ctx.fillText(ptsText, photoCenterX, ptsY + 2);
      }

      ctx.restore();
    } catch (err: any) {
      console.error('Error rendering poster:', err);
      setRenderError('Failed to generate poster artwork.');
    } finally {
      setRendering(false);
    }
  }, [winner, competition]);

  // Trigger rendering when modal opens and after DOM mount
  useEffect(() => {
    if (isOpen && winner) {
      const timer = setTimeout(() => {
        renderPoster();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, winner, renderPoster]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const studentName = winner?.participant?.name || winner?.name || 'Winner';
      const rank = winner?.rank || 'Winner';
      const filename = `JeelaniFest2026_${rank}_${studentName.replace(/\s+/g, '_')}.jpg`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download poster:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      afterOpenChange={(open) => {
        if (open && winner) {
          renderPoster();
        }
      }}
      footer={null}
      width={600}
      centered
      closeIcon={<CloseOutlined className="text-slate-400 hover:text-slate-200 text-lg" />}
      className="winner-poster-modal"
      styles={{
        body: {
          borderRadius: '24px',
          padding: '20px 24px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div className="flex flex-col items-center text-center max-h-[75vh]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-0.5 shrink-0">
          <TrophyFilled className="text-amber-400 text-lg" />
          <h3 className="text-lg font-extrabold text-white tracking-wide">
            Official Winner Poster
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 mb-3 shrink-0">
          Jeelani Fest 2026 High-Resolution Victory Certificate & Poster
        </p>

        {/* Canvas Preview Container (Constrained height to ensure 80vh fit) */}
        <div className="relative w-full max-w-[330px] md:max-w-[360px] aspect-[3750/4688] max-h-[48vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 flex items-center justify-center shrink">
          {rendering && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-3">
              <Spin size="large" />
              <span className="text-xs font-semibold text-amber-400 tracking-wider">
                Generating Poster Artwork...
              </span>
            </div>
          )}

          {renderError && !rendering && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 gap-3 p-6 text-center">
              <ExclamationCircleOutlined className="text-amber-400 text-3xl" />
              <span className="text-sm font-bold text-slate-200">{renderError}</span>
              <button
                onClick={() => renderPoster()}
                className="mt-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Retry Rendering
              </button>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain transition-opacity duration-300"
            style={{ opacity: rendering || renderError ? 0 : 1 }}
          />
        </div>

        {/* Action Controls (Pinned at bottom of 80vh modal) */}
        <div className="flex items-center justify-center gap-3 mt-4 w-full max-w-[360px] shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
          >
            Close
          </button>
          
          <button
            onClick={handleDownload}
            disabled={rendering || downloading || !!renderError}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {downloading ? (
              <Spin size="small" />
            ) : (
              <>
                <DownloadOutlined className="text-sm" />
                <span>Download Poster (JPG)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

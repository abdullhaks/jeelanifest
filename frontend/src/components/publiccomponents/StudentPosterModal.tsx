import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Spin, message } from 'antd';
import { DownloadOutlined, TrophyFilled, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import profileBgSrc from '../../assets/profilebg.png';
import defaultDpSrc from '../../assets/dp.jpg';

interface StudentPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

// Helper function to safely load image with timeout, cache check, and CORS support
const loadImage = (src: string, crossOrigin?: string, timeoutMs: number = 5000): Promise<HTMLImageElement | null> => {
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

// Canvas helper to draw rounded rectangle with fallback
const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[]
) => {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    // Fallback for older browsers
    const radius = typeof r === 'number' ? r : r[0] || 0;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
};

// Helper to fit text with ellipsis
const getTruncatedText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 3 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
};

export const StudentPosterModal: React.FC<StudentPosterModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendering, setRendering] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const renderPoster = useCallback(async () => {
    if (!student) return;

    setRendering(true);
    setRenderError(null);

    // Ensure canvas DOM ref is ready
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

    // Canvas dimensions matching profilebg.png exactly (3264 x 1836, 16:9 ratio)
    const CANVAS_WIDTH = 3264;
    const CANVAS_HEIGHT = 1836;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setRenderError('Canvas 2D context not available.');
      setRendering(false);
      return;
    }

    try {
      // 1. Clear Canvas & Draw Background Image
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const bgImg = await loadImage(profileBgSrc, undefined, 5000);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // 2. Load Student Avatar Image
      const studentImgUrl =
        student.profileImage || student.image || student.avatarUrl || student.photo;
      let avatarImg: HTMLImageElement | null = null;
      if (studentImgUrl) {
        avatarImg = await loadImage(studentImgUrl, 'anonymous', 4000);
      }
      if (!avatarImg) {
        avatarImg = await loadImage(defaultDpSrc, undefined, 4000);
      }

      // 3. Render Top Center: Student Avatar Frame
      // The festival logo is in the top-left (approx X: 60-760, Y: 40-420)
      // The total score card is in the top-right (approx X: 2650-3050, Y: 70-380)
      // Center zone is X: 1632
      const centerX = 1632;
      const photoCenterY = 160;
      const photoRadius = 115; // Diameter = 230px

      ctx.save();
      // Drop Shadow for circular photo frame
      ctx.shadowColor = 'rgba(245, 158, 11, 0.35)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 10;

      // Outer Gold Gradient Ring
      ctx.beginPath();
      ctx.arc(centerX, photoCenterY, photoRadius + 14, 0, Math.PI * 2);
      const goldRingGrad = ctx.createLinearGradient(
        centerX - photoRadius,
        photoCenterY - photoRadius,
        centerX + photoRadius,
        photoCenterY + photoRadius
      );
      goldRingGrad.addColorStop(0, '#F59E0B');
      goldRingGrad.addColorStop(0.5, '#FDE68A');
      goldRingGrad.addColorStop(1, '#D97706');
      ctx.fillStyle = goldRingGrad;
      ctx.fill();

      // Inner White Crisp Ring
      ctx.beginPath();
      ctx.arc(centerX, photoCenterY, photoRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Clip Path for Student Photo
      ctx.beginPath();
      ctx.arc(centerX, photoCenterY, photoRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.shadowColor = 'transparent';

      if (avatarImg && avatarImg.width > 0 && avatarImg.height > 0) {
        // Draw Image centered & cropped (cover style)
        const aspect = avatarImg.width / avatarImg.height;
        let drawW = photoRadius * 2;
        let drawH = photoRadius * 2;
        let drawX = centerX - photoRadius;
        let drawY = photoCenterY - photoRadius;

        if (aspect > 1) {
          drawW = photoRadius * 2 * aspect;
          drawX = centerX - drawW / 2;
        } else {
          drawH = (photoRadius * 2) / aspect;
          drawY = photoCenterY - drawH / 2;
        }
        ctx.drawImage(avatarImg, drawX, drawY, drawW, drawH);
      } else {
        // Fallback Monogram Avatar
        const radialBg = ctx.createRadialGradient(
          centerX,
          photoCenterY,
          20,
          centerX,
          photoCenterY,
          photoRadius
        );
        radialBg.addColorStop(0, '#1E293B');
        radialBg.addColorStop(1, '#020617');
        ctx.fillStyle = radialBg;
        ctx.fillRect(centerX - photoRadius, photoCenterY - photoRadius, photoRadius * 2, photoRadius * 2);

        const initial = (student.name || 'S').charAt(0).toUpperCase();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'italic 900 110px "Georgia", serif';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText(initial, centerX, photoCenterY + 8);
      }
      ctx.restore();

      // 4. Render Student Name (Bold, Pristine Typography with dynamic scaling)
      const studentName = (student.name || 'STUDENT NAME').toUpperCase();
      let nameFontSize = 62;
      ctx.font = `900 ${nameFontSize}px "Georgia", "Inter", sans-serif`;
      while (ctx.measureText(studentName).width > 1050 && nameFontSize > 34) {
        nameFontSize -= 2;
        ctx.font = `900 ${nameFontSize}px "Georgia", "Inter", sans-serif`;
      }

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(studentName, centerX, 335);
      ctx.restore();

      // 5. Render Student Details Badges Row (Chest No, Class, Team, Category)
      const badges: { label: string; text: string; bg: string; border: string; textCol: string }[] = [];
      if (student.chestNo) {
        badges.push({
          label: 'CHEST',
          text: `#${student.chestNo}`,
          bg: 'rgba(245, 158, 11, 0.18)',
          border: 'rgba(245, 158, 11, 0.6)',
          textCol: '#FCD34D',
        });
      }
      if (student.class) {
        badges.push({
          label: 'CLASS',
          text: `CLASS ${student.class}`.toUpperCase(),
          bg: 'rgba(148, 163, 184, 0.15)',
          border: 'rgba(148, 163, 184, 0.45)',
          textCol: '#F1F5F9',
        });
      }
      const groupName = student.group?.name;
      if (groupName) {
        badges.push({
          label: 'TEAM',
          text: `HOUSE: ${groupName}`.toUpperCase(),
          bg: 'rgba(99, 102, 241, 0.22)',
          border: 'rgba(129, 140, 248, 0.55)',
          textCol: '#E0E7FF',
        });
      }
      if (student.category) {
        badges.push({
          label: 'CATEGORY',
          text: student.category.toUpperCase(),
          bg: 'rgba(16, 185, 129, 0.18)',
          border: 'rgba(52, 211, 153, 0.5)',
          textCol: '#6EE7B7',
        });
      }

      if (badges.length > 0) {
        ctx.font = '800 20px "Inter", sans-serif';
        const badgeSpacing = 14;
        const badgeHeight = 38;
        const badgePaddings = 24;

        // Calculate total width of all badges to center them
        const badgeWidths = badges.map((b) => ctx.measureText(b.text).width + badgePaddings * 2);
        const totalBadgesWidth =
          badgeWidths.reduce((sum, w) => sum + w, 0) + (badges.length - 1) * badgeSpacing;

        let currentBadgeX = centerX - totalBadgesWidth / 2;
        const badgeY = 390;

        badges.forEach((b, idx) => {
          const bw = badgeWidths[idx];
          ctx.save();
          drawRoundRect(ctx, currentBadgeX, badgeY - badgeHeight / 2, bw, badgeHeight, 19);
          ctx.fillStyle = b.bg;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = b.border;
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = b.textCol;
          ctx.fillText(b.text, currentBadgeX + bw / 2, badgeY + 1);
          ctx.restore();

          currentBadgeX += bw + badgeSpacing;
        });
      }

      // 6. Render Top Right: Total Score Card
      const scoreCardW = 360;
      const scoreCardH = 220;
      const scoreCardX = 2860 - scoreCardW / 2;
      const scoreCardY = 190 - scoreCardH / 2;

      ctx.save();
      // Drop Shadow for Score Card
      ctx.shadowColor = 'rgba(245, 158, 11, 0.22)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 6;

      // Card Background
      drawRoundRect(ctx, scoreCardX, scoreCardY, scoreCardW, scoreCardH, 24);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.fill();

      // Card Golden Border
      ctx.lineWidth = 2.5;
      const scoreBorderGrad = ctx.createLinearGradient(scoreCardX, scoreCardY, scoreCardX + scoreCardW, scoreCardY + scoreCardH);
      scoreBorderGrad.addColorStop(0, '#F59E0B');
      scoreBorderGrad.addColorStop(0.5, '#FDE68A');
      scoreBorderGrad.addColorStop(1, '#B45309');
      ctx.strokeStyle = scoreBorderGrad;
      ctx.stroke();

      // Top Highlight Line inside card
      ctx.beginPath();
      ctx.moveTo(scoreCardX + 30, scoreCardY + 1);
      ctx.lineTo(scoreCardX + scoreCardW - 30, scoreCardY + 1);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.stroke();
      ctx.restore();

      // Score Card Text
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Label: TOTAL SCORE
      ctx.font = '900 22px "Inter", sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.letterSpacing = '3px';
      ctx.fillText('TOTAL SCORE', 2860, scoreCardY + 45);

      // Score Value: Large Glowing Gold Number
      const totalPoints = student.points || 0;
      ctx.font = '900 84px "Inter", "Segoe UI", sans-serif';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 24;
      const scoreNumGrad = ctx.createLinearGradient(2860 - 80, scoreCardY + 115, 2860 + 80, scoreCardY + 115);
      scoreNumGrad.addColorStop(0, '#FFFFFF');
      scoreNumGrad.addColorStop(0.3, '#FEF3C7');
      scoreNumGrad.addColorStop(1, '#F59E0B');
      ctx.fillStyle = scoreNumGrad;
      ctx.fillText(`${totalPoints}`, 2860, scoreCardY + 115);

      // Subtitle: FESTIVAL POINTS
      ctx.shadowColor = 'transparent';
      ctx.font = '800 16px "Inter", sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.letterSpacing = '2px';
      ctx.fillText('FESTIVAL POINTS', 2860, scoreCardY + 175);
      ctx.restore();

      // 7. Extract & Sort Won Competitions (1st, 2nd, 3rd)
      const rankPriority: Record<string, number> = { '1st': 1, '2nd': 2, '3rd': 3 };
      const wonPrograms = (student.programs || [])
        .filter((p: any) => p.hasWon || (p.rankAwarded && ['1st', '2nd', '3rd'].includes(p.rankAwarded)))
        .sort((a: any, b: any) => {
          const rA = rankPriority[a.rankAwarded] || 99;
          const rB = rankPriority[b.rankAwarded] || 99;
          if (rA !== rB) return rA - rB;
          return (b.pointsAwarded || 0) - (a.pointsAwarded || 0);
        });

      // 8. Section Divider & Heading: WON COMPETITIONS
      // Generous breathing room between top profile section and competitions
      const sectionHeadingY = 580;
      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '900 42px "Georgia", "Inter", serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 10;
      const sectionTitleText = 'WON COMPETITIONS';
      ctx.fillText(sectionTitleText, 160, sectionHeadingY);
      const titleMetrics = ctx.measureText(sectionTitleText);

      // Counter Pill next to title (e.g. 6 AWARDS WON)
      const counterText = `${wonPrograms.length} ${wonPrograms.length === 1 ? 'AWARD WON' : 'AWARDS WON'}`;
      ctx.font = '800 20px "Inter", sans-serif';
      const counterW = ctx.measureText(counterText).width + 32;
      const counterH = 34;
      const counterX = 160 + titleMetrics.width + 24;

      drawRoundRect(ctx, counterX, sectionHeadingY - counterH / 2, counterW, counterH, 17);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FCD34D';
      ctx.fillText(counterText, counterX + counterW / 2, sectionHeadingY + 1);

      // Horizontal Decorative Golden Accent Line
      const dividerY = 620;
      ctx.beginPath();
      ctx.moveTo(160, dividerY);
      ctx.lineTo(3080, dividerY);
      ctx.lineWidth = 2.5;
      const dividerGrad = ctx.createLinearGradient(160, dividerY, 3080, dividerY);
      dividerGrad.addColorStop(0, 'rgba(245, 158, 11, 0.85)');
      dividerGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.3)');
      dividerGrad.addColorStop(1, 'rgba(245, 158, 11, 0.02)');
      ctx.strokeStyle = dividerGrad;
      ctx.stroke();
      ctx.restore();

      // 9. Competitions Grid Rendering
      // Available bounding box: X: 160 -> 3080 (Width: 2920), Y: 660 -> 1760 (Height: 1100)
      const gridLeft = 160;
      const gridRight = 3080;
      const gridTop = 660;
      const gridBottom = 1760;
      const availableW = gridRight - gridLeft; // 2920px
      const availableH = gridBottom - gridTop; // 1100px

      const totalItems = wonPrograms.length;

      if (totalItems === 0) {
        // Recognition Certificate Card for Participants who haven't won 1st/2nd/3rd yet
        const emptyW = 2000;
        const emptyH = 360;
        const emptyX = centerX - emptyW / 2;
        const emptyY = gridTop + 140;

        ctx.save();
        drawRoundRect(ctx, emptyX, emptyY, emptyW, emptyH, 28);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 42px "Georgia", serif';
        ctx.fillStyle = '#FCD34D';
        ctx.fillText('OFFICIAL PARTICIPANT OF JEELANI FEST 2026', centerX, emptyY + 110);

        ctx.font = '600 26px "Inter", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(
          'Commended for active dedication, sporting spirit, and participation across all enrolled competitions.',
          centerX,
          emptyY + 185
        );

        ctx.font = '800 24px "Inter", sans-serif';
        ctx.fillStyle = '#34D399';
        ctx.fillText(
          `TOTAL ENROLLED COMPETITIONS: ${student.programs?.length || 0}`,
          centerX,
          emptyY + 260
        );
        ctx.restore();
      } else {
        // Dynamic Grid Calculation: Cap at max 4 columns (4 elements in a row) to fill the bottom area elegantly
        let cols = 2;
        if (totalItems > 12) {
          cols = 4;
        } else if (totalItems > 6) {
          cols = 3;
        } else {
          cols = 2;
        }

        const rows = Math.ceil(totalItems / cols);

        // Calculate card dimensions and gap spacing based on columns & rows
        let gapX = 24;
        let gapY = 18;

        if (rows >= 9) {
          gapY = 10;
          gapX = 22;
        } else if (rows >= 6) {
          gapY = 14;
          gapX = 24;
        } else if (rows >= 4) {
          gapY = 18;
          gapX = 28;
        } else {
          gapY = 24;
          gapX = 36;
        }

        const cardWidth = (availableW - (cols - 1) * gapX) / cols;
        const maxPossibleCardHeight = (availableH - (rows - 1) * gapY) / rows;
        
        let cardHeight = Math.min(
          cols <= 2 ? 150 : cols === 3 ? 120 : 100,
          maxPossibleCardHeight
        );
        cardHeight = Math.max(cardHeight, 62); // Minimum safe height

        // Draw each won competition card
        wonPrograms.forEach((p: any, idx: number) => {
          const c = idx % cols;
          const r = Math.floor(idx / cols);

          const cardX = gridLeft + c * (cardWidth + gapX);
          const cardY = gridTop + r * (cardHeight + gapY);

          const rank = p.rankAwarded || '1st';
          const points = p.pointsAwarded || 0;
          const comp = p.competition || {};
          const compName = (comp.name || 'Competition').toUpperCase();

          // Rank styling definitions
          let rankBorder = 'rgba(245, 158, 11, 0.45)';
          let rankAccentStart = '#F59E0B';
          let rankAccentEnd = '#D97706';
          let pillBgStart = '#F59E0B';
          let pillBgEnd = '#B45309';
          let pillText = '1ST';
          let pillTextColor = '#000000';

          if (rank === '1st') {
            rankBorder = 'rgba(245, 158, 11, 0.55)';
            rankAccentStart = '#F59E0B';
            rankAccentEnd = '#D97706';
            pillBgStart = '#F59E0B';
            pillBgEnd = '#D97706';
            pillText = '🥇 1ST';
            pillTextColor = '#000000';
          } else if (rank === '2nd') {
            rankBorder = 'rgba(148, 163, 184, 0.45)';
            rankAccentStart = '#CBD5E1';
            rankAccentEnd = '#64748B';
            pillBgStart = '#E2E8F0';
            pillBgEnd = '#94A3B8';
            pillText = '🥈 2ND';
            pillTextColor = '#0F172A';
          } else if (rank === '3rd') {
            rankBorder = 'rgba(217, 119, 6, 0.45)';
            rankAccentStart = '#EA580C';
            rankAccentEnd = '#9A3412';
            pillBgStart = '#F97316';
            pillBgEnd = '#C2410C';
            pillText = '🥉 3RD';
            pillTextColor = '#FFFFFF';
          }

          ctx.save();
          // Card Box
          drawRoundRect(ctx, cardX, cardY, cardWidth, cardHeight, 14);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = rankBorder;
          ctx.stroke();

          // Left Color Accent Bar
          ctx.save();
          drawRoundRect(ctx, cardX, cardY, 6, cardHeight, [14, 0, 0, 14]);
          const accentGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
          accentGrad.addColorStop(0, rankAccentStart);
          accentGrad.addColorStop(1, rankAccentEnd);
          ctx.fillStyle = accentGrad;
          ctx.fill();
          ctx.restore();

          // Rank Pill on Left
          const isCompact = cardHeight < 82;
          const rankPillW = isCompact ? 80 : 90;
          const rankPillH = isCompact ? 30 : 34;
          const rankPillX = cardX + 16;
          const rankPillY = cardY + (cardHeight - rankPillH) / 2;

          drawRoundRect(ctx, rankPillX, rankPillY, rankPillW, rankPillH, rankPillH / 2);
          const pillGrad = ctx.createLinearGradient(rankPillX, rankPillY, rankPillX + rankPillW, rankPillY + rankPillH);
          pillGrad.addColorStop(0, pillBgStart);
          pillGrad.addColorStop(1, pillBgEnd);
          ctx.fillStyle = pillGrad;
          ctx.fill();

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `900 ${isCompact ? 16 : 18}px "Inter", sans-serif`;
          ctx.fillStyle = pillTextColor;
          ctx.fillText(pillText, rankPillX + rankPillW / 2, rankPillY + rankPillH / 2 + 1);

          // Points Pill on Right
          const ptsText = `+${points} PTS`;
          ctx.font = `900 ${isCompact ? 18 : 20}px "Inter", sans-serif`;
          const ptsMetrics = ctx.measureText(ptsText);
          const ptsW = ptsMetrics.width + (isCompact ? 22 : 26);
          const ptsH = isCompact ? 30 : 34;
          const ptsX = cardX + cardWidth - ptsW - 16;
          const ptsY = cardY + (cardHeight - ptsH) / 2;

          drawRoundRect(ctx, ptsX, ptsY, ptsW, ptsH, 10);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.fillStyle = '#34D399';
          ctx.fillText(ptsText, ptsX + ptsW / 2, ptsY + ptsH / 2 + 1);

          // Middle: Competition Name
          const textStartX = rankPillX + rankPillW + 16;
          const maxTextW = ptsX - textStartX - 16;

          const showSubtitle = cardHeight >= 110 && cols <= 3;
          const compFontSize = isCompact ? 19 : cols === 4 ? 22 : cols === 3 ? 24 : 26;

          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.font = `800 ${compFontSize}px "Inter", sans-serif`;
          ctx.fillStyle = '#F8FAFC';

          const truncatedTitle = getTruncatedText(ctx, compName, maxTextW);
          const titleY = showSubtitle ? cardY + cardHeight * 0.38 : cardY + cardHeight / 2;
          ctx.fillText(truncatedTitle, textStartX, titleY);

          // Subtitle (Category & Event Type) if ample space
          if (showSubtitle) {
            const subCategory = (comp.category || student.category || '').toUpperCase();
            const subType = comp.type === 'group' ? 'GROUP EVENT' : 'INDIVIDUAL EVENT';
            const subText = [subCategory, subType].filter(Boolean).join(' • ');

            ctx.font = '700 15px "Inter", sans-serif';
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(getTruncatedText(ctx, subText, maxTextW), textStartX, cardY + cardHeight * 0.7);
          }

          ctx.restore();
        });
      }
    } catch (err: any) {
      console.error('Error rendering student poster:', err);
      setRenderError('Failed to generate student profile poster.');
    } finally {
      setRendering(false);
    }
  }, [student]);

  // Trigger rendering when modal opens
  useEffect(() => {
    if (isOpen && student) {
      const timer = setTimeout(() => {
        renderPoster();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, student, renderPoster]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      const cleanName = (student?.name || 'Student').replace(/\s+/g, '_');
      const filename = `JeelaniFest2026_Profile_${cleanName}.jpg`;

      // Detect iOS devices explicitly (iPhone, iPad, iPod, iPadOS)
      const isIOS =
        typeof navigator !== 'undefined' &&
        (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

      if (isIOS) {
        // iOS Strategy: Use Web Share API or open blob in new tab
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.94);
        });

        if (!blob) {
          throw new Error('Failed to generate image blob from canvas');
        }

        const file = new File([blob], filename, { type: 'image/jpeg' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: filename,
              text: `Jeelani Fest 2026 Student Profile Poster - ${student?.name}`,
            });
            message.success('Student profile poster ready and shared successfully!');
            return;
          } catch (shareErr: any) {
            if (shareErr.name === 'AbortError') {
              return;
            }
            console.warn('iOS Web Share API failed, using fallback tab:', shareErr);
          }
        }

        // iOS Fallback: Open Blob URL in a new window/tab
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          window.location.href = blobUrl;
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        message.success('Profile poster opened! Long press to save to your Photos.');
      } else {
        // Non-iOS devices (Windows PC, Mac, Linux, Android): Direct File Download
        const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('Student profile poster downloaded successfully!');
      }
    } catch (err) {
      console.error('Failed to download profile poster:', err);
      message.error('Failed to download poster. Please try again.');
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
        if (open && student) {
          renderPoster();
        }
      }}
      footer={null}
      width={680}
      centered
      closeIcon={<CloseOutlined className="text-slate-400 hover:text-slate-200 text-lg" />}
      className="student-poster-modal"
      styles={{
        body: {
          borderRadius: '24px',
          padding: '20px 24px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div className="flex flex-col items-center text-center max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-0.5 shrink-0">
          <TrophyFilled className="text-amber-400 text-lg" />
          <h3 className="text-lg font-extrabold text-white tracking-wide">
            Official Student Profile Poster
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 mb-3 shrink-0">
          Jeelani Fest 2026 High-Resolution Profile Record & Merit Poster
        </p>

        {/* Canvas Preview Container (16:9 aspect ratio matching 3264x1836) */}
        <div className="relative w-full max-w-[580px] aspect-[3264/1836] max-h-[48vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black flex items-center justify-center shrink">
          {rendering && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-3">
              <Spin size="large" />
              <span className="text-xs font-semibold text-amber-400 tracking-wider">
                Generating Profile Artwork...
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

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 mt-4 w-full max-w-[420px] shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleDownload}
            disabled={rendering || downloading || !!renderError}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {downloading ? (
              <Spin size="small" />
            ) : (
              <>
                <DownloadOutlined className="text-sm" />
                <span>Download Profile Poster (JPG)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

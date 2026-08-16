import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Avatar } from 'antd';
import { 
  ArrowLeftOutlined, 
  ShareAltOutlined, 
  CopyOutlined, 
  WhatsAppOutlined, 
  TrophyOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  CheckOutlined,
  RightOutlined,
  PictureOutlined,
  TrophyFilled
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import { LatticeBackground } from '../../components/publiccomponents/DesignSystem';

const ParticipantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await apiClient.get(`/public/students/${id}`);
        setStudent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    message.success('Profile link copied to clipboard! You can now share it with parents.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: `${student?.name || 'Student'} - Jeelani Fest 2026 Profile`,
      text: `Check out ${student?.name}'s details, points, and event schedule at Jeelani Fest 2026!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const getWhatsAppShareUrl = () => {
    const text = `Check out *${student?.name}*'s performance and scheduled programs at Jeelani Fest 2026!\n\nLink: ${window.location.href}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-slate-900">
      <Spin size="large" />
    </div>
  );

  if (!student) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] text-slate-500 gap-4">
      <p className="text-lg font-medium">Participant profile not found.</p>
      <button
        onClick={() => navigate('/participants')}
        className="px-6 py-2 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-400 transition-colors shadow-md"
      >
        Return to Participants
      </button>
    </div>
  );

  const programs = student.programs || [];

  return (
    <div className="min-h-screen pt-28 pb-24 relative bg-[#FDFBF7] text-slate-900 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <LatticeBackground opacity={0.06} parallax={false} />

      <div className="w-full mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/participants')}
            className="flex items-center gap-2 font-bold text-slate-500 hover:text-emerald-600 transition-colors bg-white/80 border border-slate-200/90 px-4 py-2 rounded-full text-sm backdrop-blur-md shadow-sm"
          >
            <ArrowLeftOutlined /> Back to Roster
          </button>

          {/* Quick Share Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white text-xs font-black tracking-wide transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <ShareAltOutlined /> Share Profile
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="rounded-3xl bg-white/95 border border-slate-200/80 p-6 sm:p-10 mb-8 backdrop-blur-xl shadow-xl relative overflow-hidden">
          {/* Header Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-600" />

          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              {student.profileImage ? (
                <Avatar src={student.profileImage} size={110} className="border-4 border-white ring-4 ring-amber-100 shadow-xl" style={{ background: 'linear-gradient(135deg, #064E3B, #022C22)' }} />
              ) : (
                <Avatar
                  size={110}
                  className="shrink-0 border-4 border-white ring-4 ring-amber-100 shadow-xl font-black text-4xl"
                  style={{
                    background: 'linear-gradient(135deg, #064E3B, #022C22)',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {student.name.charAt(0).toUpperCase()}
                </Avatar>
              )}
              {student.chestNo && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-xs shadow-md border border-amber-300">
                  #{student.chestNo}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold tracking-widest uppercase mb-2 shadow-sm">
                Official Participant Showcase
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight font-display">
                {student.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-3">
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shadow-sm">
                  Class {student.class}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase shadow-sm">
                  {student.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-sm">
                  🏠 {student.group?.name || 'House Team'}
                </span>
              </div>

              {/* Coordinator Share Action Toolbar */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-colors shadow-sm"
                >
                  <ShareAltOutlined /> Native Share
                </button>

                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors shadow-sm"
                >
                  <WhatsAppOutlined /> Share on WhatsApp
                </a>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors shadow-sm"
                >
                  {copied ? <CheckOutlined className="text-emerald-500" /> : <CopyOutlined />}
                  {copied ? 'Link Copied!' : 'Copy Page Link'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-100 text-center shadow-sm relative overflow-hidden">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 mb-1">Total Points Scored</div>
            <div className="font-mono text-4xl font-black text-emerald-700">{student.points || 0}</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1 uppercase">Festival Points</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-100 text-center shadow-sm relative overflow-hidden">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 mb-1">Enrolled Programs</div>
            <div className="font-mono text-4xl font-black text-emerald-700">{programs.length}</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1 uppercase">Competitions</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-white border border-amber-100 text-center shadow-sm relative overflow-hidden">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 mb-1">House Group</div>
            <div className="font-bold text-xl text-amber-800 line-clamp-1 mt-2">{student.group?.name || 'N/A'}</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1 uppercase">Championship Team</div>
          </div>
        </div>

        {/* Enrolled Programs & Detailed Schedule */}
        <div className="rounded-3xl bg-white/95 border border-slate-200/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 font-display">
            <TrophyOutlined className="text-amber-500" />
            Enrolled Competitions & Event Schedule
          </h3>

          {programs.length > 0 ? (
            <div className="space-y-4">
              {programs.map((p: any, idx: number) => {
                const comp = p.competition || {};
                const compName = comp.name || 'Competition Program';
                const typeStr = comp.type ? (comp.type === 'group' ? 'Group Event' : 'Individual Event') : 'Individual';
                const catStr = comp.category ? comp.category.toUpperCase() : student.category.toUpperCase();
                const dateStr = comp.date;
                const timeStr = comp.time;
                const stageStr = comp.stage ? (comp.stage === 'stage1' ? 'Stage 1' : comp.stage === 'stage2' ? 'Stage 2' : 'Off Stage') : null;
                const rank = p.rankAwarded;
                const isWinner = Boolean(p.hasWon || (rank && ['1st', '2nd', '3rd'].includes(rank)));
                const targetResultId = p.resultId || comp._id;

                if (isWinner) {
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.012, y: -2 }}
                      whileTap={{ scale: 0.988 }}
                      onClick={() => {
                        if (targetResultId) {
                          navigate(`/results/${targetResultId}`);
                        }
                      }}
                      className={`cursor-pointer transition-all p-5 sm:p-6 rounded-2xl relative overflow-hidden group shadow-md ${
                        rank === '1st'
                          ? 'bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-white border-2 border-amber-400 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/20'
                          : rank === '2nd'
                          ? 'bg-gradient-to-r from-slate-400/10 via-slate-100/70 to-white border-2 border-slate-300 hover:border-slate-400 hover:shadow-xl hover:shadow-slate-400/20'
                          : 'bg-gradient-to-r from-amber-700/10 via-orange-50/60 to-white border-2 border-amber-600/40 hover:border-amber-600 hover:shadow-xl hover:shadow-orange-500/20'
                      } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                    >
                      {/* Decorative Ribbon / Glow bar */}
                      <div
                        className={`absolute top-0 left-0 bottom-0 w-2 ${
                          rank === '1st'
                            ? 'bg-gradient-to-b from-amber-400 to-yellow-500'
                            : rank === '2nd'
                            ? 'bg-gradient-to-b from-slate-300 to-slate-500'
                            : 'bg-gradient-to-b from-orange-400 to-amber-700'
                        }`}
                      />

                      {/* Left details */}
                      <div className="space-y-2 pl-2 sm:pl-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-lg text-slate-900 font-display group-hover:text-amber-600 transition-colors">
                            {compName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700 uppercase">
                            {catStr}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {typeStr}
                          </span>
                          {p.pointsAwarded ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              +{p.pointsAwarded} PTS
                            </span>
                          ) : null}
                        </div>

                        {/* Date & Time badges */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5 font-bold bg-white/90 shadow-sm border border-slate-200 px-3 py-1 rounded-xl">
                            <CalendarOutlined className="text-amber-500" />
                            {dateStr ? dateStr : 'Fest Schedule'}
                          </span>

                          <span className="flex items-center gap-1.5 font-bold bg-white/90 shadow-sm border border-slate-200 px-3 py-1 rounded-xl">
                            <ClockCircleOutlined className="text-emerald-500" />
                            {timeStr ? timeStr : 'Completed'}
                          </span>

                          {stageStr && (
                            <span className="flex items-center gap-1.5 font-bold bg-white/90 shadow-sm border border-slate-200 px-3 py-1 rounded-xl">
                              <EnvironmentOutlined className="text-purple-500" />
                              {stageStr}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right award status & Clickable Action */}
                      <div className="shrink-0 flex flex-wrap sm:flex-col items-start sm:items-end justify-between gap-2.5 pl-2 sm:pl-0 mt-2 sm:mt-0">
                        {/* 1st / 2nd / 3rd badge */}
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide border shadow-sm flex items-center gap-1.5 ${
                            rank === '1st'
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-amber-500/20'
                              : rank === '2nd'
                              ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 border-slate-400 shadow-slate-300/30'
                              : 'bg-gradient-to-r from-orange-400 to-amber-600 text-white border-orange-500 shadow-orange-500/20'
                          }`}
                        >
                          <TrophyFilled />
                          {rank === '1st'
                            ? '🥇 1st Place Winner'
                            : rank === '2nd'
                            ? '🥈 2nd Place Winner'
                            : '🥉 3rd Place Winner'}
                        </span>

                        {/* Direct Poster Download CTA Button */}
                        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white group-hover:bg-amber-500 group-hover:text-slate-950 font-bold text-xs transition-all shadow-sm">
                          <PictureOutlined className="text-sm" />
                          <span>View Result & Download Poster</span>
                          <RightOutlined className="text-[10px] transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left details */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900 font-display">
                          {compName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700 uppercase">
                          {catStr}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {typeStr}
                        </span>
                      </div>

                      {/* Date & Time badges */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5 font-bold bg-white shadow-sm border border-slate-200 px-3 py-1 rounded-xl">
                          <CalendarOutlined className="text-amber-500" />
                          {dateStr ? dateStr : 'Date To Be Announced'}
                        </span>

                        <span className="flex items-center gap-1.5 font-bold bg-white shadow-sm border border-slate-200 px-3 py-1 rounded-xl">
                          <ClockCircleOutlined className="text-emerald-500" />
                          {timeStr ? timeStr : 'Time To Be Announced'}
                        </span>

                        {stageStr && (
                          <span className="flex items-center gap-1.5 font-bold bg-white shadow-sm border border-slate-200 px-3 py-1 rounded-xl">
                            <EnvironmentOutlined className="text-purple-500" />
                            {stageStr}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right status */}
                    <div className="shrink-0 mt-2 sm:mt-0">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 shadow-sm">
                        Confirmed Enrolled
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-sm font-medium">
              No programs enrolled for this student yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetail;

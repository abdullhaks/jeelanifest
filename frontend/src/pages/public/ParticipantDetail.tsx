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
  CheckOutlined
} from '@ant-design/icons';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <Spin size="large" />
    </div>
  );

  if (!student) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-4">
      <p className="text-lg">Participant profile not found.</p>
      <button
        onClick={() => navigate('/participants')}
        className="px-6 py-2 rounded-full bg-sky-600 text-white font-bold hover:bg-sky-500 transition-colors"
      >
        Return to Participants
      </button>
    </div>
  );

  const programs = student.programs || [];

  return (
    <div className="min-h-screen pt-28 pb-24 relative bg-slate-950 text-white overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sky-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[450px] h-[450px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none" />
      <LatticeBackground opacity={0.03} parallax={false} />

      <div className="w-full mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/participants')}
            className="flex items-center gap-2 font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-full text-sm backdrop-blur-md"
          >
            <ArrowLeftOutlined /> Back to Roster
          </button>

          {/* Quick Share Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-lg shadow-sky-600/20 active:scale-95"
            >
              <ShareAltOutlined /> Share Profile
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 mb-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Header Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-emerald-400 to-indigo-500" />

          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              {student.profileImage ? (
                <Avatar src={student.profileImage} size={110} className="border-4 border-slate-700 shadow-2xl" />
              ) : (
                <Avatar
                  size={110}
                  className="shrink-0 border-4 border-slate-700 shadow-2xl font-black text-4xl"
                  style={{
                    background: 'linear-gradient(135deg, #0284C7, #0F4C3A)',
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
              <div className="inline-block px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold tracking-widest uppercase mb-2">
                Official Participant Showcase
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight font-display">
                {student.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-3">
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                  Class {student.class}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
                  {student.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                  🏠 {student.group?.name || 'House Team'}
                </span>
              </div>

              {/* Coordinator Share Action Toolbar */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition-colors"
                >
                  <ShareAltOutlined /> Native Share
                </button>

                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                >
                  <WhatsAppOutlined /> Share on WhatsApp
                </a>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
                >
                  {copied ? <CheckOutlined className="text-emerald-400" /> : <CopyOutlined />}
                  {copied ? 'Link Copied!' : 'Copy Page Link'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/30 text-center relative overflow-hidden">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 mb-1">Total Points Scored</div>
            <div className="font-mono text-4xl font-black text-white">{student.points || 0}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Festival Points</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-500/10 via-slate-900 to-slate-900 border border-sky-500/30 text-center relative overflow-hidden">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400 mb-1">Enrolled Programs</div>
            <div className="font-mono text-4xl font-black text-white">{programs.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Competitions</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-900 border border-indigo-500/30 text-center relative overflow-hidden">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 mb-1">House Group</div>
            <div className="font-bold text-xl text-white line-clamp-1 mt-2">{student.group?.name || 'N/A'}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Championship Team</div>
          </div>
        </div>

        {/* Enrolled Programs & Detailed Schedule */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-display">
            <TrophyOutlined className="text-amber-400" />
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

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left details */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-white font-display">
                          {compName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 uppercase">
                          {catStr}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {typeStr}
                        </span>
                      </div>

                      {/* Date & Time badges */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1.5 font-medium bg-slate-900/80 border border-slate-700/80 px-3 py-1 rounded-xl text-sky-300">
                          <CalendarOutlined className="text-sky-400" />
                          {dateStr ? dateStr : 'Date To Be Announced'}
                        </span>

                        <span className="flex items-center gap-1.5 font-medium bg-slate-900/80 border border-slate-700/80 px-3 py-1 rounded-xl text-emerald-300">
                          <ClockCircleOutlined className="text-emerald-400" />
                          {timeStr ? timeStr : 'Time To Be Announced'}
                        </span>

                        {stageStr && (
                          <span className="flex items-center gap-1.5 font-medium bg-slate-900/80 border border-slate-700/80 px-3 py-1 rounded-xl text-purple-300">
                            <EnvironmentOutlined className="text-purple-400" />
                            {stageStr}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right award status */}
                    <div className="shrink-0">
                      {rank ? (
                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide border shadow-md inline-block ${
                          rank === '1st' ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' :
                          rank === '2nd' ? 'bg-slate-300/20 text-slate-200 border-slate-300/40' :
                          'bg-orange-400/20 text-orange-300 border-orange-400/40'
                        }`}>
                          {rank === '1st' ? '🥇 1st Place Winner' : rank === '2nd' ? '🥈 2nd Place Winner' : '🥉 3rd Place Winner'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700">
                          Confirmed Enrolled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-slate-400 text-sm">
              No programs enrolled for this student yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetail;

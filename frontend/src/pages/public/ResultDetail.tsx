import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Avatar } from 'antd';
import { ArrowLeftOutlined, TrophyFilled, PictureOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import { LatticeBackground, GlassCard, SectionHeading, PodiumCard, BrassDivider } from '../../components/publiccomponents/DesignSystem';
import { WinnerPosterModal } from '../../components/publiccomponents/WinnerPosterModal';

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWinner, setSelectedWinner] = useState<any>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const handleOpenPoster = (winner: any) => {
    setSelectedWinner(winner);
    setIsPosterModalOpen(true);
  };

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await apiClient.get(`/public/results/${id}`);
        setResult(res.data);
        // Normalize URL to the canonical Result ID if reached via competition ID
        if (res.data?._id && res.data._id !== id) {
          navigate(`/results/${res.data._id}`, { replace: true });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResult();
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
      <Spin size="large" />
    </div>
  );

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-slate-400 font-medium">
      Result not found or not published.
    </div>
  );

  const first = result.winners?.find((w: any) => w.rank === '1st');
  const second = result.winners?.find((w: any) => w.rank === '2nd');
  const third = result.winners?.find((w: any) => w.rank === '3rd');

  return (
    <div className="min-h-screen pt-32 pb-20 relative bg-[#F8F9FA] text-slate-900">
      <LatticeBackground opacity={0.04} />

      <div className="w-full mx-auto px-6 max-w-4xl relative z-10">
        {/* Back button */}
        <button
          onClick={() => navigate('/results')}
          className="flex items-center gap-2 font-bold mb-10 text-slate-500 hover:text-sky-600 transition-colors"
        >
          <ArrowLeftOutlined /> Back to Published Results
        </button>

        {/* Result Header */}
        <GlassCard className="p-10 md:p-14 mb-10 bg-white border border-slate-200/90 shadow-xl text-center relative overflow-hidden" hover={false}>
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-wrap justify-center gap-3 mb-6 relative z-10">
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
              {result.competition?.category || 'General'}
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
              <TrophyFilled className="text-amber-500" /> Official Winner Sheet
            </span>
          </div>

          {/* Programme Name (Styled Italic Typography) */}
          <h1
            className="text-4xl md:text-6xl font-black mb-4 italic tracking-tight leading-tight text-slate-900 drop-shadow-sm"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif, var(--font-display)' }}
          >
            {result.competition?.name}
          </h1>

          <div className="inline-block px-5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 mt-2">
            {result.competition?.type === 'group' ? '👥 Group Championship Event' : '👤 Individual Talent Event'}
          </div>
        </GlassCard>

        {/* Podium Presentation */}
        {(first || second || third) && (
          <div className="grid grid-cols-3 gap-4 mb-12 items-end">
            {/* 2nd Place */}
            <div className="pt-8 flex flex-col items-center">
              {second && (
                <>
                  <PodiumCard
                    rank="2nd"
                    name={second.participant?.name || 'Winner'}
                    subtitle={second.chestCode || second.participant?.chestNo || undefined}
                    points={second.pointsAwarded}
                    image={second.participant?.profileImage || second.participant?.image || second.participant?.avatarUrl || (second.participantType === 'Group' ? (second.participant?.logoUrl || second.participant?.logo) : undefined)}
                    groupName={second.participant?.group?.name || second.group?.name || (second.participantType === 'Group' ? second.participant?.name : undefined)}
                  />
                  <button
                    onClick={() => handleOpenPoster(second)}
                    className="mt-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-extrabold text-xs transition-all border border-slate-300 shadow-sm cursor-pointer hover:scale-105"
                  >
                    <PictureOutlined /> Poster
                  </button>
                </>
              )}
            </div>
            {/* 1st Place (elevated) */}
            <div className="flex flex-col items-center">
              {first && (
                <>
                  <PodiumCard
                    rank="1st"
                    name={first.participant?.name || 'Winner'}
                    subtitle={first.chestCode || first.participant?.chestNo || undefined}
                    points={first.pointsAwarded}
                    image={first.participant?.profileImage || first.participant?.image || first.participant?.avatarUrl || (first.participantType === 'Group' ? (first.participant?.logoUrl || first.participant?.logo) : undefined)}
                    groupName={first.participant?.group?.name || first.group?.name || (first.participantType === 'Group' ? first.participant?.name : undefined)}
                    elevated
                  />
                  <button
                    onClick={() => handleOpenPoster(first)}
                    className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer hover:scale-105"
                  >
                    <PictureOutlined /> Generate Poster
                  </button>
                </>
              )}
            </div>
            {/* 3rd Place */}
            <div className="pt-12 flex flex-col items-center">
              {third && (
                <>
                  <PodiumCard
                    rank="3rd"
                    name={third.participant?.name || 'Winner'}
                    subtitle={third.chestCode || third.participant?.chestNo || undefined}
                    points={third.pointsAwarded}
                    image={third.participant?.profileImage || third.participant?.image || third.participant?.avatarUrl || (third.participantType === 'Group' ? (third.participant?.logoUrl || third.participant?.logo) : undefined)}
                    groupName={third.participant?.group?.name || third.group?.name || (third.participantType === 'Group' ? third.participant?.name : undefined)}
                  />
                  <button
                    onClick={() => handleOpenPoster(third)}
                    className="mt-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-900/10 hover:bg-amber-900/20 text-amber-900 font-extrabold text-xs transition-all border border-amber-800/30 shadow-sm cursor-pointer hover:scale-105"
                  >
                    <PictureOutlined /> Poster
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <BrassDivider />

        {/* Full Winner Breakdown */}
        <SectionHeading title="Winner Breakdown" centered={true} className="mt-10 mb-8" />

        <div className="space-y-4">
          {result.winners?.map((winner: any, index: number) => {
            const isFirst = winner.rank === '1st';
            const isSecond = winner.rank === '2nd';
            const isThird = winner.rank === '3rd';

            // Premium custom card styling per rank
            let cardStyling = 'bg-white border border-slate-200 shadow-sm';
            let badgeBg = 'bg-slate-100 text-slate-600 border-slate-200';
            let positionTitle = `${winner.rank || `#${index + 1}`} Rank`;

            if (isFirst) {
              cardStyling = 'bg-gradient-to-r from-amber-500/15 via-yellow-100/30 to-white border-2 border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02] relative';
              badgeBg = 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-extrabold shadow-md border-amber-300';
              positionTitle = '🥇 1st Place Winner';
            } else if (isSecond) {
              cardStyling = 'bg-gradient-to-r from-slate-200/50 via-slate-100/20 to-white border-2 border-slate-300 shadow-md';
              badgeBg = 'bg-gradient-to-tr from-slate-600 to-slate-400 text-white font-extrabold shadow-sm border-slate-300';
              positionTitle = '🥈 2nd Place Winner';
            } else if (isThird) {
              cardStyling = 'bg-gradient-to-r from-amber-900/10 via-orange-950/5 to-white border-2 border-amber-800/30 shadow-sm';
              badgeBg = 'bg-gradient-to-tr from-amber-800 to-orange-700 text-white font-extrabold shadow-sm border-amber-600';
              positionTitle = '🥉 3rd Place Winner';
            }

            const participantName = winner.participant?.name || winner.name || 'Winner';
            const chestNo = winner.chestCode || winner.participant?.chestNo || 'N/A';
            const groupObj = winner.participant?.group || winner.group;
            
            // Fix group name extraction: avoid 'Independent House' fallback
            let groupName = 'Jeelani House';
            if (groupObj && typeof groupObj === 'object' && groupObj.name) {
              groupName = groupObj.name;
            } else if (winner.participantType === 'Group') {
              groupName = winner.participant?.name || 'Group Championship';
            } else if (winner.participant?.category) {
              groupName = `${winner.participant.category.toUpperCase()} HOUSE`;
            }

            const groupLogo = groupObj?.logoUrl || groupObj?.logo || groupObj?.image;
            const studentPhoto = winner.participant?.profileImage || winner.participant?.image || winner.participant?.avatarUrl;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <GlassCard className={`p-6 flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl ${cardStyling}`} hover={false}>
                  <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full sm:w-auto">
                    {/* Rank Badge / Student Photo Avatar */}
                    <div className="relative shrink-0">
                      {studentPhoto ? (
                        <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-md">
                          <img
                            src={studentPhoto}
                            alt={participantName}
                            className="w-full h-full rounded-full object-cover border-2 border-white"
                          />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-mono font-extrabold text-lg border ${badgeBg}`}>
                          {winner.rank || `#${index + 1}`}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-black uppercase tracking-wider mb-1 text-slate-500">
                        {positionTitle}
                      </div>
                      <div className="font-extrabold text-xl md:text-2xl text-slate-900 break-words w-full" style={{ fontFamily: 'var(--font-display)' }}>
                        {participantName}
                      </div>
                      {chestNo !== 'N/A' && (
                        <div className="text-xs font-medium text-slate-500 mt-1">
                          Chest Code: <span className="font-extrabold text-sky-600">{chestNo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Group Emblem, Points & Poster Action */}
                  <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 text-center justify-center md:justify-end w-full md:w-auto">
                    {/* Group Emblem Badge */}
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                      {groupLogo ? (
                        <img
                          src={groupLogo}
                          alt={groupName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <Avatar style={{ backgroundColor: isFirst ? '#D97706' : (isSecond ? '#475569' : '#7C2D12'), color: '#FFFFFF', fontWeight: 'black' }}>
                          {groupName.charAt(0)}
                        </Avatar>
                      )}
                      <div className="font-extrabold text-sm text-slate-800 break-words max-w-[120px] text-left">{groupName}</div>
                    </div>

                    <div>
                      <div className={`font-mono font-black text-2xl ${isFirst ? 'text-amber-600' : (isSecond ? 'text-slate-600' : 'text-amber-800')}`}>
                        +{winner.pointsAwarded || 0} Pts
                      </div>
                    </div>

                    {/* Generate Poster Button */}
                    <button
                      onClick={() => handleOpenPoster(winner)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-500/25 text-amber-800 font-extrabold text-xs transition-all border border-amber-300 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <PictureOutlined className="text-amber-600 text-sm" /> Generate Poster
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Winner Poster Modal */}
      <WinnerPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        winner={selectedWinner}
        competition={result?.competition}
      />
    </div>
  );
};

export default ResultDetail;


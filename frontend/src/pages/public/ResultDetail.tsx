import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Avatar } from 'antd';
import { ArrowLeftOutlined, TrophyFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import { LatticeBackground, GlassCard, SectionHeading, PodiumCard, BrassDivider } from '../../components/publiccomponents/DesignSystem';

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await apiClient.get(`/public/results/${id}`);
        setResult(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResult();
  }, [id]);

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
        <GlassCard className="p-10 mb-10 bg-white border border-slate-200 shadow-sm text-center" hover={false}>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100">
              {result.competition?.category}
            </span>
            <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100">
              <TrophyFilled /> Official Winner Sheet
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {result.competition?.name}
          </h1>
          <p className="text-base uppercase tracking-wider font-bold text-slate-400">
            {result.competition?.type === 'group' ? 'Group Event' : 'Individual Event'}
          </p>
        </GlassCard>

        {/* Podium Presentation */}
        {(first || second || third) && (
          <div className="grid grid-cols-3 gap-4 mb-12 items-end">
            {/* 2nd Place */}
            <div className="pt-8">
              {second && (
                <PodiumCard
                  rank="2nd"
                  name={second.participant?.name || 'Winner'}
                  subtitle={second.chestCode || second.participant?.chestNo || undefined}
                  points={second.pointsAwarded}
                />
              )}
            </div>
            {/* 1st Place (elevated) */}
            <div>
              {first && (
                <PodiumCard
                  rank="1st"
                  name={first.participant?.name || 'Winner'}
                  subtitle={first.chestCode || first.participant?.chestNo || undefined}
                  points={first.pointsAwarded}
                  elevated
                />
              )}
            </div>
            {/* 3rd Place */}
            <div className="pt-12">
              {third && (
                <PodiumCard
                  rank="3rd"
                  name={third.participant?.name || 'Winner'}
                  subtitle={third.chestCode || third.participant?.chestNo || undefined}
                  points={third.pointsAwarded}
                />
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
              cardStyling = 'bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-white border-2 border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02] relative';
              badgeBg = 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-extrabold shadow-md border-amber-300';
              positionTitle = '🥇 1st Place Winner';
            } else if (isSecond) {
              cardStyling = 'bg-gradient-to-r from-slate-200/40 via-slate-100/20 to-white border-2 border-slate-300 shadow-md';
              badgeBg = 'bg-gradient-to-tr from-slate-600 to-slate-400 text-white font-extrabold shadow-sm border-slate-300';
              positionTitle = '🥈 2nd Place Winner';
            } else if (isThird) {
              cardStyling = 'bg-gradient-to-r from-amber-950/5 via-amber-900/5 to-white border-2 border-amber-700/30 shadow-sm';
              badgeBg = 'bg-gradient-to-tr from-amber-800 to-orange-700 text-white font-extrabold shadow-sm border-amber-600';
              positionTitle = '🥉 3rd Place Winner';
            }

            const participantName = winner.participant?.name || 'Winner';
            const chestNo = winner.chestCode || winner.participant?.chestNo || 'N/A';
            const groupObj = winner.participant?.group || winner.group;
            const groupName = groupObj?.name || (winner.participantType === 'Group' ? winner.participant?.name : 'Independent House');
            const groupLogo = groupObj?.logoUrl || groupObj?.logo || groupObj?.image;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <GlassCard className={`p-6 flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl ${cardStyling}`} hover={false}>
                  <div className="flex items-center gap-5 text-center md:text-left">
                    {/* Rank Badge */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-mono font-extrabold text-lg shrink-0 border ${badgeBg}`}>
                      {winner.rank || `#${index + 1}`}
                    </div>

                    <div>
                      <div className="text-xs font-black uppercase tracking-wider mb-1 text-slate-500">
                        {positionTitle}
                      </div>
                      <div className="font-extrabold text-xl md:text-2xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                        {participantName}
                      </div>
                      {chestNo !== 'N/A' && (
                        <div className="text-xs font-medium text-slate-500 mt-1">
                          Chest Code: <span className="font-extrabold text-sky-600">{chestNo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Group Logo & Points */}
                  <div className="flex items-center gap-6 text-center md:text-right">
                    {/* Group Emblem Logo */}
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                      {groupLogo ? (
                        <img
                          src={groupLogo}
                          alt={groupName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <Avatar style={{ backgroundColor: '#0284C7', color: '#FFFFFF', fontWeight: 'bold' }}>
                          {groupName.charAt(0)}
                        </Avatar>
                      )}
                      <div className="font-extrabold text-sm text-slate-800">{groupName}</div>
                    </div>

                    <div>
                      <div className="font-mono font-black text-2xl text-sky-600">
                        +{winner.pointsAwarded || 0} Pts
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;

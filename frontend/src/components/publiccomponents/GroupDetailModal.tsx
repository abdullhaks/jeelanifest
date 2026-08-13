import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Spin, Avatar, Tag } from 'antd';
import { TrophyOutlined, FireOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import apiClient from '../../services/apiClient';

interface GroupDetailModalProps {
  groupId: string | null;
  open: boolean;
  onClose: () => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({ groupId, open, onClose }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'breakdown' | 'topScorers' | 'members'>('breakdown');

  useEffect(() => {
    if (open && groupId) {
      setLoading(true);
      apiClient.get(`/public/groups/${groupId}/breakdown`)
        .then(res => {
          setData(res.data);
        })
        .catch(err => {
          console.error(err);
          // Fallback if breakdown endpoint fails
          Promise.all([
            apiClient.get(`/public/groups/${groupId}`).catch(() => null),
            apiClient.get(`/public/students`, {
              params: { filter: JSON.stringify({ group: groupId }), limit: 50, sortBy: 'points', sortOrder: 'desc' }
            }).catch(() => null)
          ]).then(([groupRes, studentsRes]) => {
            const groupObj = groupRes?.data || null;
            const studentList = studentsRes?.data?.data || [];
            setData({
              group: groupObj,
              totalPoints: groupObj?.totalPoints || 0,
              members: studentList,
              topScorers: studentList.filter((s: any) => (s.points || 0) > 0),
              pointBreakdown: []
            });
          });
        })
        .finally(() => setLoading(false));
    }
  }, [open, groupId]);

  const group = data?.group;
  const topScorers = data?.topScorers || [];
  const members = data?.members || [];
  const pointBreakdown = data?.pointBreakdown || [];
  const totalPoints = data?.totalPoints ?? group?.totalPoints ?? 0;

  const getRankBadge = (rank: string) => {
    if (rank === '1st') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-sm">
          🥇 1st Place
        </span>
      );
    }
    if (rank === '2nd') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1 shadow-sm">
          🥈 2nd Place
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-300 flex items-center gap-1 shadow-sm">
        🥉 3rd Place
      </span>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4"
          style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full h-[80vh] flex flex-col shadow-2xl border border-slate-200 relative text-slate-900 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors text-base z-10"
              onClick={onClose}
            >
              ✕
            </button>

            {loading ? (
              <div className="py-24 text-center my-auto"><Spin size="large" /></div>
            ) : group ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-5 mb-5 pb-5 border-b border-slate-100 shrink-0">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-lg shrink-0 overflow-hidden"
                    style={{
                      fontFamily: 'var(--font-display)',
                      background: 'linear-gradient(135deg, #0284C7, #0F4C3A)',
                      color: '#FFFFFF',
                      border: '3px solid #E2E8F0',
                    }}
                  >
                    {(group.logoUrl || group.logo || group.image) ? (
                      <img src={group.logoUrl || group.logo || group.image} alt={group.name} className="w-full h-full object-cover" />
                    ) : (
                      group.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                      <Tag color="blue" className="font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded-full">
                        House / Group
                      </Tag>
                      <Tag color="gold" className="font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <TrophyOutlined /> Contender
                      </Tag>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                      {group.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      Competing in Jeelani Fest 2026 Championship
                    </p>
                  </div>
                  <div className="text-center md:text-right bg-gradient-to-br from-sky-50 to-emerald-50 px-5 py-3 rounded-2xl border border-sky-100 shrink-0 shadow-sm">
                    <div className="font-mono text-2xl sm:text-3xl font-extrabold text-sky-600">
                      {totalPoints}
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-0.5">
                      Total Points
                    </div>
                  </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex border-b border-slate-200 mb-4 gap-2 sm:gap-6 shrink-0">
                  <button
                    onClick={() => setActiveTab('breakdown')}
                    className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === 'breakdown'
                        ? 'border-sky-600 text-sky-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <UnorderedListOutlined /> Point Breakdown ({pointBreakdown.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('topScorers')}
                    className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === 'topScorers'
                        ? 'border-sky-600 text-sky-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FireOutlined className="text-amber-500" /> Top Scorers ({topScorers.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('members')}
                    className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === 'members'
                        ? 'border-sky-600 text-sky-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <UserOutlined /> All Members ({members.length})
                  </button>
                </div>

                {/* Tab 1: Itemized Point Breakdown */}
                {activeTab === 'breakdown' && (
                  <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3">
                    {pointBreakdown.map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-400 w-5">
                            #{idx + 1}
                          </span>
                          <Avatar
                            src={item.participantPhoto}
                            size={40}
                            style={{ border: '2px solid #E2E8F0', backgroundColor: '#0284C7' }}
                          >
                            {item.participantName?.charAt(0) || 'G'}
                          </Avatar>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                              <span>{item.competitionName}</span>
                              {item.category && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-sky-100 text-sky-800">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">
                              Winner: <span className="font-semibold text-slate-800">{item.participantName}</span>
                              {item.chestCode && (
                                <span className="ml-1 text-slate-400">({item.chestCode})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                          {getRankBadge(item.rank)}
                          <div className="font-mono font-extrabold text-emerald-600 text-base bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                            +{item.pointsAwarded} marks
                          </div>
                        </div>
                      </div>
                    ))}

                    {pointBreakdown.length === 0 && (
                      <div className="py-12 text-center text-slate-400 text-sm font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        No published competition wins recorded yet for this house.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Top Scorers */}
                {activeTab === 'topScorers' && (
                  <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3">
                    {topScorers.map((st: any, idx: number) => (
                      <div
                        key={st._id || idx}
                        className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-slate-100/80 transition-all cursor-pointer"
                        onClick={() => {
                          onClose();
                          navigate(`/participants/${st._id}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={st.profileImage}
                            size={40}
                            style={{
                              backgroundColor: idx === 0 ? '#FEF3C7' : idx === 1 ? '#F1F5F9' : '#E0F2FE',
                              color: idx === 0 ? '#D97706' : idx === 1 ? '#475569' : '#0284C7',
                              fontWeight: 'bold',
                              border: '2px solid #E2E8F0',
                            }}
                          >
                            #{idx + 1}
                          </Avatar>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                            <div className="text-xs text-slate-400 font-medium">
                              Chest: <span className="font-semibold text-slate-700">{st.chestNo || 'N/A'}</span> • Class {st.class}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-extrabold text-sky-600 text-base">{st.points} pts</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">{st.category}</div>
                        </div>
                      </div>
                    ))}

                    {topScorers.length === 0 && (
                      <div className="py-12 text-center text-slate-400 text-sm font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        No member scores recorded yet for this house.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Complete Member Roster */}
                {activeTab === 'members' && (
                  <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 auto-rows-max">
                    {members.map((member: any) => (
                      <div
                        key={member._id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/80 hover:border-slate-300 transition-colors cursor-pointer"
                        onClick={() => {
                          onClose();
                          navigate(`/participants/${member._id}`);
                        }}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {member.profileImage ? (
                            <Avatar src={member.profileImage} size={36} className="border border-slate-200 shrink-0" />
                          ) : (
                            <Avatar size={36} className="bg-sky-600 text-white font-bold text-xs shrink-0">
                              {member.name ? member.name.charAt(0).toUpperCase() : 'S'}
                            </Avatar>
                          )}
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-slate-900 truncate">{member.name}</div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              Chest: {member.chestNo || 'N/A'} • Class {member.class} {member.category && `• ${member.category}`}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0 ml-2">
                          {member.points || 0} pts
                        </span>
                      </div>
                    ))}

                    {members.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-400 text-sm font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        No members enrolled in this house group yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-medium">Group details not found.</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


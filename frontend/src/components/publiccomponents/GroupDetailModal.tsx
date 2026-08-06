import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spin, Avatar, Tag } from 'antd';
import { TrophyOutlined, FireOutlined } from '@ant-design/icons';
import apiClient from '../../services/apiClient';

interface GroupDetailModalProps {
  groupId: string | null;
  open: boolean;
  onClose: () => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({ groupId, open, onClose }) => {
  const [group, setGroup] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && groupId) {
      setLoading(true);
      // Fetch group details and top students
      Promise.all([
        apiClient.get(`/public/groups`),
        apiClient.get(`/public/students`, {
          params: { filter: JSON.stringify({ group: groupId }), limit: 20, sortBy: 'points', sortOrder: 'desc' }
        })
      ]).then(([groupsRes, studentsRes]) => {
        const found = groupsRes.data.data?.find((g: any) => g._id === groupId);
        setGroup(found || null);
        setStudents(studentsRes.data.data || []);
      }).catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [open, groupId]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 relative text-slate-900"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors text-lg"
              onClick={onClose}
            >
              ✕
            </button>

            {loading ? (
              <div className="py-24 text-center"><Spin size="large" /></div>
            ) : group ? (
              <div>
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 mb-8 pb-6 border-b border-slate-100">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center font-extrabold text-4xl shadow-lg shrink-0"
                    style={{
                      fontFamily: 'var(--font-display)',
                      background: 'linear-gradient(135deg, #0284C7, #0F4C3A)',
                      color: '#FFFFFF',
                      border: '4px solid #E2E8F0',
                    }}
                  >
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                      <Tag color="blue" className="font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded-full">
                        House / Group
                      </Tag>
                      <Tag color="gold" className="font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <TrophyOutlined /> Contender
                      </Tag>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                      {group.name}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Competing in Jeelani Fest 2026 Championship
                    </p>
                  </div>
                  <div className="text-center md:text-right bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 shrink-0">
                    <div className="font-mono text-3xl font-extrabold text-sky-600">
                      {group.totalPoints || group.points || 0}
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Total Points
                    </div>
                  </div>
                </div>

                {/* Top Members / Scoring Roster */}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                    <FireOutlined className="text-amber-500" /> Top Scoring Members ({students.length})
                  </h3>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {students.map((st, idx) => (
                      <div
                        key={st._id || idx}
                        className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            style={{
                              backgroundColor: idx === 0 ? '#FEF3C7' : idx === 1 ? '#F1F5F9' : '#E0F2FE',
                              color: idx === 0 ? '#D97706' : idx === 1 ? '#475569' : '#0284C7',
                              fontWeight: 'bold',
                              border: '1px solid #E2E8F0',
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
                    {students.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-sm font-medium">
                        No member scores recorded yet for this house.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-medium">Group not found.</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

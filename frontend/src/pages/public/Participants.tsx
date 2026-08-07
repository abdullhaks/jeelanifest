import { useState, useEffect } from 'react';
import { Input, Pagination, Spin, Select, Modal, Avatar } from 'antd';
import { SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import { LatticeBackground, GlassCard, SectionHeading } from '../../components/publiccomponents/DesignSystem';

const getStarRating = (rank: string | null) => {
  if (rank === '1st') return '⭐⭐⭐';
  if (rank === '2nd') return '⭐⭐';
  if (rank === '3rd') return '⭐';
  return '';
};

const Participants = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    apiClient.get('/public/groups').then(res => setGroups(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (categoryFilter) filters.category = categoryFilter;
      if (groupFilter) filters.group = groupFilter;

      const res = await apiClient.get('/public/students', {
        params: {
          page,
          limit: 12,
          search: debouncedSearch,
          filter: JSON.stringify(filters),
          sortBy: 'points',
          sortOrder: 'desc'
        }
      });
      setData(res.data.data);
      setTotal(res.data.meta.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, categoryFilter, groupFilter]);

  const handleOpenDetail = async (id: string) => {
    setModalLoading(true);
    setModalVisible(true);
    try {
      const res = await apiClient.get(`/public/students/${id}`);
      setSelectedStudent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 relative bg-[#F8F9FA] text-slate-900">
      <LatticeBackground opacity={0.03} parallax={false} />

      <div className="max-w-7xl w-full mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <SectionHeading
            title="Festival Participants"
            titleAr="المشاركون في المهرجان"
            subtitle="Discover participants, total points, and program accomplishments."
            centered={true}
          />

          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-2xl mt-2">
            <Select
              allowClear
              placeholder="Category"
              className="w-36 h-12 rounded-full"
              size="large"
              onChange={val => { setCategoryFilter(val); setPage(1); }}
              options={[
                { value: 'subJunior', label: 'Sub Junior' },
                { value: 'junior', label: 'Junior' },
                { value: 'senior', label: 'Senior' }
              ]}
            />
            <Select
              allowClear
              placeholder="Group / Team"
              className="w-44 h-12 rounded-full"
              size="large"
              onChange={val => { setGroupFilter(val); setPage(1); }}
              options={groups.map(g => ({ value: g._id, label: g.name }))}
            />
            <Input
              prefix={<SearchOutlined className="text-sky-600 mr-1" />}
              placeholder="Search name or chest no..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full sm:w-64 h-12 rounded-full bg-white border border-slate-200 shadow-sm"
              size="large"
              allowClear
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24"><Spin size="large" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {data.map((student, index) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                >
                  <GlassCard
                    className="p-5 flex items-center justify-between bg-white border border-slate-200 shadow-sm hover:shadow-md"
                    onClick={() => handleOpenDetail(student._id)}
                  >
                    <div className="flex items-center gap-4">
                      {student.profileImage ? (
                        <Avatar src={student.profileImage} size={56} className="border-2 border-slate-100 shadow-sm" />
                      ) : (
                        <Avatar
                          size={56}
                          style={{
                            backgroundColor: '#0284C7',
                            fontSize: '22px',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            border: '2px solid #E2E8F0',
                          }}
                        >
                          {student.name.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <div>
                        <h3
                          className="font-extrabold text-base text-slate-900 line-clamp-1"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs mt-1 text-slate-500 font-medium">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100"
                          >
                            {student.chestNo || 'N/A'}
                          </span>
                          <span>Class {student.class}</span>
                        </div>
                        <div className="text-[10px] uppercase font-bold mt-1.5 text-slate-400">
                          {student.category} • <span className="text-emerald-700">{student.group?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right pl-4">
                      <div className="font-mono text-xl font-extrabold text-sky-600">{student.points}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Pts</div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {data.length === 0 && (
              <GlassCard className="text-center py-24" hover={false}>
                <p style={{ color: 'rgba(243, 236, 221, 0.3)' }}>No participants matched your search criteria.</p>
              </GlassCard>
            )}

            {total > 12 && (
              <div className="flex justify-center mt-12">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={12}
                  onChange={setPage}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Student Detail Modal */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered
        width={620}
        styles={{ body: { padding: 0 } }}
        className="dark-modal"
      >
        {modalLoading || !selectedStudent ? (
          <div className="py-24 text-center bg-slate-900 rounded-3xl"><Spin size="large" /></div>
        ) : (
          <div className="p-8 md:p-10 rounded-3xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-2xl">
            {/* Background Radiant Blur */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-8 pb-6 border-b border-slate-800 relative z-10">
              {selectedStudent.profileImage ? (
                <Avatar src={selectedStudent.profileImage} size={96} className="border-4 border-slate-700 shadow-xl shrink-0" />
              ) : (
                <Avatar
                  size={96}
                  className="shrink-0 border-4 border-slate-700 shadow-xl"
                  style={{
                    backgroundColor: '#0F4C3A',
                    fontSize: '40px',
                    fontWeight: '900',
                    fontFamily: 'var(--font-display)',
                    color: '#C9A063',
                  }}
                >
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </Avatar>
              )}
              <div className="flex-1">
                <h2
                  className="text-3xl font-black text-white m-0 leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {selectedStudent.name}
                </h2>
                <p className="font-bold text-slate-400 mt-1 text-sm">Class: {selectedStudent.class}</p>
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  {selectedStudent.chestNo && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-amber-400/10 text-amber-400 border border-amber-400/20">
                      CHEST #{selectedStudent.chestNo}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {selectedStudent.group?.name || 'Individual'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {selectedStudent.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1">Total Score</div>
                <div className="font-mono text-3xl font-black text-white">{selectedStudent.points} <span className="text-xs text-slate-400 font-sans">PTS</span></div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Programs Enrolled</div>
                <div className="font-mono text-3xl font-black text-white">{selectedStudent.programs?.length || 0}</div>
              </div>
            </div>

            {/* Programs & Achievements */}
            <div className="relative z-10">
              <h4 className="font-extrabold text-base mb-4 flex items-center gap-2 text-white" style={{ fontFamily: 'var(--font-display)' }}>
                <TrophyOutlined className="text-amber-400" /> Enrolled Programs & Achievements
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {selectedStudent.programs?.map((p: any, idx: number) => {
                  const compName = p.competition?.name || 'Competition Program';
                  const rankStr = p.rankAwarded ? `${p.rankAwarded.toUpperCase()} ${getStarRating(p.rankAwarded)}` : null;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center px-4 py-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60"
                    >
                      <span className="font-bold text-sm text-slate-200">{compName}</span>
                      {rankStr ? (
                        <span className="font-black text-xs px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                          {rankStr}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700/80 text-slate-400">
                          Enrolled
                        </span>
                      )}
                    </div>
                  );
                })}
                {(!selectedStudent.programs || selectedStudent.programs.length === 0) && (
                  <p className="text-sm text-center py-6 text-slate-500 font-medium">
                    No programs assigned to this student.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Participants;

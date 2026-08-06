import { useState, useEffect } from 'react';
import { Input, Pagination, Spin, Select, Modal, Tag, Avatar } from 'antd';
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
        width={600}
        styles={{ body: { padding: 0 } }}
      >
        {modalLoading || !selectedStudent ? (
          <div className="py-20 text-center"><Spin size="large" /></div>
        ) : (
          <div className="p-8" style={{ background: 'var(--ink-navy)' }}>
            {/* Profile Header */}
            <div className="flex items-center space-x-6 mb-8">
              {selectedStudent.profileImage ? (
                <Avatar src={selectedStudent.profileImage} size={90} style={{ border: '3px solid var(--glass-border)' }} />
              ) : (
                <Avatar
                  size={90}
                  style={{
                    backgroundColor: 'var(--emerald-deep)',
                    fontSize: '36px',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--brass-gold)',
                    border: '3px solid var(--glass-border)',
                  }}
                >
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </Avatar>
              )}
              <div>
                <h2
                  className="text-2xl md:text-3xl font-bold m-0"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory-parchment)' }}
                >
                  {selectedStudent.name}
                </h2>
                <p className="font-medium mt-1" style={{ color: 'rgba(243, 236, 221, 0.5)' }}>Class {selectedStudent.class}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedStudent.chestNo && (
                    <Tag style={{ background: 'rgba(201,160,99,0.1)', border: '1px solid rgba(201,160,99,0.2)', color: 'var(--brass-gold)' }}>
                      Chest: {selectedStudent.chestNo}
                    </Tag>
                  )}
                  <Tag style={{ background: 'rgba(26,122,94,0.15)', border: '1px solid rgba(26,122,94,0.25)', color: 'var(--emerald-light)' }}>
                    {selectedStudent.group?.name || 'No Group'}
                  </Tag>
                  <Tag style={{ background: 'rgba(110,36,48,0.15)', border: '1px solid rgba(110,36,48,0.25)', color: '#E8A0AC' }}>
                    {selectedStudent.category?.toUpperCase()}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div
                className="p-4 rounded-2xl text-center"
                style={{ background: 'rgba(26, 122, 94, 0.1)', border: '1px solid rgba(26, 122, 94, 0.2)' }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--emerald-light)' }}>Total Points</div>
                <div className="font-mono text-3xl font-bold" style={{ color: 'var(--brass-gold)' }}>{selectedStudent.points}</div>
              </div>
              <div
                className="p-4 rounded-2xl text-center"
                style={{ background: 'rgba(243, 236, 221, 0.03)', border: '1px solid rgba(243, 236, 221, 0.08)' }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(243, 236, 221, 0.4)' }}>Programs Enrolled</div>
                <div className="font-mono text-3xl font-bold" style={{ color: 'var(--ivory-parchment)' }}>{selectedStudent.programs?.length || 0}</div>
              </div>
            </div>

            {/* Programs & Achievements */}
            <div>
              <h4 className="font-bold text-base mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory-parchment)' }}>
                <TrophyOutlined style={{ color: 'var(--brass-gold)' }} /> Enrolled Programs & Achievements
              </h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {selectedStudent.programs?.map((p: any, idx: number) => {
                  const compName = p.competition?.name || 'Competition Program';
                  const rankStr = p.rankAwarded ? `${p.rankAwarded.toUpperCase()} ${getStarRating(p.rankAwarded)}` : null;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
                    >
                      <span className="font-semibold text-sm" style={{ color: 'var(--ivory-parchment)' }}>{compName}</span>
                      {rankStr ? (
                        <span
                          className="font-bold text-sm px-3 py-1 rounded-md"
                          style={{ background: 'rgba(201,160,99,0.1)', border: '1px solid rgba(201,160,99,0.2)', color: 'var(--brass-gold)' }}
                        >
                          {rankStr}
                        </span>
                      ) : (
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded"
                          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(243, 236, 221, 0.3)' }}
                        >
                          Enrolled
                        </span>
                      )}
                    </div>
                  );
                })}
                {(!selectedStudent.programs || selectedStudent.programs.length === 0) && (
                  <p className="text-sm text-center py-4" style={{ color: 'rgba(243, 236, 221, 0.3)' }}>
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

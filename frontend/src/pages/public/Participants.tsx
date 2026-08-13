import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Pagination, Spin, Select, Avatar } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import { LatticeBackground, GlassCard, SectionHeading } from '../../components/publiccomponents/DesignSystem';

const Participants = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);

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
                    className="p-5 flex items-center justify-between bg-white border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-1"
                    onClick={() => navigate(`/participants/${student._id}`)}
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
                            {student.chestNo ? `#${student.chestNo}` : 'N/A'}
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
    </div>
  );
};

export default Participants;

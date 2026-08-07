import { useState, useEffect } from 'react';
import { Input, Pagination, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import { LatticeBackground, GlassCard, SectionHeading } from '../../components/publiccomponents/DesignSystem';
import { GroupDetailModal } from '../../components/publiccomponents/GroupDetailModal';

const Groups = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Group modal state
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/public/groups', {
        params: {
          page,
          limit: 12,
          search: debouncedSearch,
          sortBy: 'totalPoints',
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
  }, [page, debouncedSearch]);

  const maxPoints = Math.max(...data.map(g => g.totalPoints || g.points || 0), 1);

  const handleOpenGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 relative bg-[#F8F9FA] text-slate-900">
      <LatticeBackground opacity={0.03} parallax={false} />

      <div className="max-w-7xl w-full mx-auto px-6 relative z-10">
        {/* Centralised Header + Search */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <SectionHeading
            title="Competing Houses"
            titleAr="الفرق المتنافسة"
            subtitle="The groups battling for the ultimate championship. Click any house for detailed roster."
            centered={true}
          />
          <div className="w-full max-w-md mt-2">
            <Input
              prefix={<SearchOutlined className="text-sky-600 mr-1" />}
              placeholder="Search house by name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-12 rounded-full px-6 bg-white border border-slate-200 shadow-sm"
              size="large"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.map((group, index) => {
                const pts = group.totalPoints || group.points || 0;
                return (
                  <motion.div
                    key={group._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard 
                      className="p-8 flex flex-col items-center justify-center text-center h-full bg-white border border-slate-200 shadow-sm hover:shadow-md cursor-pointer group"
                      onClick={() => handleOpenGroup(group._id)}
                    >
                      {/* Rank badge */}
                      {index < 3 && (
                        <div
                          className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow"
                          style={{
                            background: index === 0 ? '#D97706' : index === 1 ? '#475569' : '#C2410C',
                          }}
                        >
                          #{index + 1}
                        </div>
                      )}

                      {/* Group initial / Logo */}
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center font-extrabold text-4xl mb-5 shadow-md group-hover:scale-105 transition-transform overflow-hidden"
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

                      <h3
                        className="font-extrabold text-xl mb-3 text-slate-900 group-hover:text-sky-600 transition-colors"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {group.name}
                      </h3>

                      {/* Points with bar */}
                      <div className="w-full mt-2">
                        <div className="font-mono font-extrabold text-2xl mb-2 text-sky-600">
                          {pts} <span className="text-xs font-sans text-slate-400">pts</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.max((pts / maxPoints) * 100, 4)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                          />
                        </div>
                        <div className="text-[10px] uppercase tracking-widest font-bold mt-3 text-slate-400">
                          View House Roster &rarr;
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>

            {data.length === 0 && (
              <GlassCard className="text-center py-20 bg-white border border-slate-200" hover={false}>
                <p className="text-slate-400 font-medium">No groups found matching your search.</p>
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

      {/* Group Detail Modal */}
      <GroupDetailModal
        groupId={selectedGroupId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Groups;

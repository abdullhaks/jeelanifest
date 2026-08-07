import { useState, useEffect, useMemo } from 'react';
import { Pagination, Spin, Select, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { LatticeBackground, GlassCard, SectionHeading } from '../../components/publiccomponents/DesignSystem';

const Results = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/public/results', {
        params: {
          page,
          limit: 50,
          sortBy: '_id',
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
  }, [page]);

  // Compute filtered results based on category & debounced search query
  const filteredData = useMemo(() => {
    let list = data;

    if (categoryFilter) {
      list = list.filter((item: any) => {
        const comp = item.competition;
        if (!comp) return false;
        if (categoryFilter === 'group') {
          return comp.type === 'group' || (comp.category && comp.category.toLowerCase() === 'group');
        }
        const compCat = (comp.category || '').toLowerCase().replace(/[\s-_]+/g, '');
        const filterCat = categoryFilter.toLowerCase().replace(/[\s-_]+/g, '');
        return compCat === filterCat;
      });
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter((item: any) => {
        const compName = item.competition?.name?.toLowerCase() || '';
        const compCategory = item.competition?.category?.toLowerCase() || '';
        const compType = item.competition?.type?.toLowerCase() || '';
        const winnerMatch = item.winners?.some((w: any) =>
          w.participant?.name?.toLowerCase().includes(q) ||
          w.participant?.groupName?.toLowerCase().includes(q) ||
          w.chestCode?.toLowerCase().includes(q)
        );
        return compName.includes(q) || compCategory.includes(q) || compType.includes(q) || winnerMatch;
      });
    }

    return list;
  }, [data, debouncedSearch, categoryFilter]);

  return (
    <div className="min-h-screen pt-32 pb-20 relative bg-[#F8F9FA] text-slate-900">
      <LatticeBackground opacity={0.03} parallax={false} />

      <div className="max-w-7xl w-full mx-auto px-6 relative z-10">
        {/* Header + Search & Filter Controls */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <SectionHeading
            title="Published Results"
            titleAr="النتائج المنشورة"
            subtitle="Official competition outcomes and winner breakdowns."
            centered={true}
          />

          {/* Search bar + Category Filter */}
          <div className="w-full max-w-2xl mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Input
              placeholder="Search competition or winner name..."
              prefix={<SearchOutlined className="text-slate-400" />}
              allowClear
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-11 rounded-full shadow-sm border-slate-300 flex-1"
              style={{ minWidth: 260 }}
            />

            <Select
              allowClear
              placeholder="Filter by Category"
              className="w-full sm:w-56 h-11"
              size="large"
              onChange={val => { setCategoryFilter(val); setPage(1); }}
              options={[
                { value: 'subJunior', label: 'Sub Junior' },
                { value: 'junior', label: 'Junior' },
                { value: 'senior', label: 'Senior' },
                { value: 'group', label: 'Group Competitions' },
                { value: 'general', label: 'General' }
              ]}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24"><Spin size="large" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((result, index) => {
                const firstWinner = result.winners?.find((w: any) => w.rank === '1st');
                const secondWinner = result.winners?.find((w: any) => w.rank === '2nd');
                const thirdWinner = result.winners?.find((w: any) => w.rank === '3rd');

                return (
                  <motion.div
                    key={result._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <GlassCard
                      className="p-6 flex flex-col items-center justify-between text-center h-full bg-white border border-slate-200 shadow-sm hover:shadow-md cursor-pointer group"
                      onClick={() => navigate(`/results/${result._id}`)}
                    >
                      {/* Top badges */}
                      <div className="w-full flex flex-col items-center">
                        <div className="flex justify-center gap-2 items-center mb-4">
                          <span
                            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100"
                          >
                            {result.competition?.category || result.competition?.type}
                          </span>
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100"
                          >
                            Official
                          </span>
                        </div>

                        <h3
                          className="font-extrabold text-xl text-slate-900 mb-5 text-center line-clamp-2 group-hover:text-sky-600 transition-colors"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {result.competition?.name || 'Competition Event'}
                        </h3>

                        {/* Winners Preview */}
                        <div
                          className="space-y-2.5 mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 w-full text-left"
                        >
                          {firstWinner && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-bold text-amber-600">🥇 1st Place</span>
                              <span className="font-bold text-slate-900 text-right truncate max-w-[160px]">
                                {firstWinner.participant?.name || 'Winner'} {firstWinner.chestCode ? `(${firstWinner.chestCode})` : ''}
                              </span>
                            </div>
                          )}
                          {secondWinner && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-bold text-slate-500">🥈 2nd Place</span>
                              <span className="font-semibold text-slate-700 text-right truncate max-w-[160px]">
                                {secondWinner.participant?.name || 'Winner'} {secondWinner.chestCode ? `(${secondWinner.chestCode})` : ''}
                              </span>
                            </div>
                          )}
                          {thirdWinner && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-bold text-orange-700">🥉 3rd Place</span>
                              <span className="font-semibold text-slate-700 text-right truncate max-w-[160px]">
                                {thirdWinner.participant?.name || 'Winner'} {thirdWinner.chestCode ? `(${thirdWinner.chestCode})` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom */}
                      <div
                        className="w-full text-sm pt-4 flex justify-between items-center border-t border-slate-100 text-slate-500 font-medium"
                      >
                        <span className="capitalize text-xs font-semibold">{result.competition?.type || 'Event'}</span>
                        <span className="font-bold text-sky-600 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          View Details &rarr;
                        </span>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>

            {filteredData.length === 0 && (
              <GlassCard className="text-center py-20" hover={false}>
                <p className="text-slate-400 font-medium">No published results found for your search/filter.</p>
              </GlassCard>
            )}

            {total > 24 && (
              <div className="flex justify-center mt-12">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={24}
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

export default Results;

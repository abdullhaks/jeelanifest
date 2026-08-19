import { useState, useEffect } from 'react';
import { Pagination, Spin, Select, Input, Tag } from 'antd';
import { SearchOutlined, TrophyFilled, ClockCircleOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { LatticeBackground, GlassCard, SectionHeading } from '../../components/publiccomponents/DesignSystem';

const PAGE_SIZE = 12;

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'subJunior', label: 'Sub Junior' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
  { value: 'group', label: 'Group Events' },
  { value: 'general', label: 'General' },
];

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
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (categoryFilter && categoryFilter !== 'all') {
        filters.category = categoryFilter;
      }

      const res = await apiClient.get('/public/results', {
        params: {
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
          filter: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        },
      });

      setData(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch (err) {
      console.error('Failed to fetch public results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, categoryFilter]);

  // Real-time synchronization when results are published/withdrawn
  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener('refresh-graphs', handleRefresh);
    return () => window.removeEventListener('refresh-graphs', handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, categoryFilter]);

  const handleCategoryChange = (val: string | null) => {
    setCategoryFilter(val === 'all' ? null : val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setCategoryFilter(null);
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(1);
  };

  // Format relative or date string
  const formatPublishedDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 relative bg-[#F8F9FA] text-slate-900">
      <LatticeBackground opacity={0.03} parallax={false} />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 relative z-10">
        {/* Header + Search & Filter Controls */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <SectionHeading
            title="Published Results"
            titleAr="النتائج المنشورة"
            subtitle="Official festival outcomes, winners podium, and live leaderboard rankings."
            centered={true}
          />

          {/* Search bar + Category Filter */}
          <div className="w-full max-w-2xl mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Input
              placeholder="Search competition, winner name, or chest code..."
              prefix={<SearchOutlined className="text-sky-600 mr-1.5" />}
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-full shadow-sm border-slate-200 flex-1 px-4 text-sm"
              size="large"
            />

            <Select
              allowClear
              placeholder="All Categories"
              value={categoryFilter || undefined}
              className="w-full sm:w-56 h-12"
              size="large"
              onChange={handleCategoryChange}
              options={CATEGORY_OPTIONS}
              suffixIcon={<FilterOutlined className="text-sky-600" />}
            />
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-3xl">
            {CATEGORY_OPTIONS.map((opt) => {
              const isSelected = (!categoryFilter && opt.value === 'all') || categoryFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleCategoryChange(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/30 scale-105'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Showing {total === 0 ? '0' : `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)}`} of {total} Published Results
            </span>
            {(categoryFilter || debouncedSearch) && (
              <span className="text-slate-400 font-medium">(Filtered)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Tag color="gold" className="rounded-full px-3 py-0.5 text-[11px] font-black uppercase tracking-wider border-0 shadow-sm">
              <ClockCircleOutlined className="mr-1" /> Latest to Oldest
            </Tag>
            <button
              onClick={fetchData}
              title="Refresh results"
              className="p-1.5 px-2.5 rounded-full text-xs font-bold bg-white text-slate-600 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 transition-all cursor-pointer"
            >
              <ReloadOutlined className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <Spin size="large" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading festival results...</p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${page}-${categoryFilter}-${debouncedSearch}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {data.map((result, index) => {
                  const firstWinner = result.winners?.find((w: any) => w.rank === '1st');
                  const secondWinner = result.winners?.find((w: any) => w.rank === '2nd');
                  const thirdWinner = result.winners?.find((w: any) => w.rank === '3rd');

                  const isGroup = result.competition?.type === 'group';
                  const categoryName = result.competition?.category || (isGroup ? 'Group Event' : 'General');
                  const publishedTime = formatPublishedDate(result.updatedAt || result.createdAt);

                  return (
                    <motion.div
                      key={result._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.25 }}
                    >
                      <GlassCard
                        className="p-6 flex flex-col justify-between h-full bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 rounded-3xl cursor-pointer group hover:-translate-y-1"
                        onClick={() => navigate(`/results/${result._id}`)}
                      >
                        {/* Top Meta Badges & Timestamp */}
                        <div>
                          <div className="w-full flex items-center justify-between gap-2 mb-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/70 shadow-xs">
                                {categoryName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-xs flex items-center gap-1">
                                <TrophyFilled className="text-[10px]" /> Official
                              </span>
                            </div>

                            {publishedTime && (
                              <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                                {publishedTime}
                              </span>
                            )}
                          </div>

                          {/* Competition Name */}
                          <h3
                            className="font-extrabold text-lg sm:text-xl text-slate-900 mb-4 line-clamp-2 group-hover:text-sky-600 transition-colors leading-snug"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {result.competition?.name || 'Competition Event'}
                          </h3>

                          {/* Winners Preview Podium Box */}
                          <div className="space-y-2 mb-5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 w-full text-left">
                            {/* 1st Place */}
                            {firstWinner ? (
                              <div className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-base leading-none shrink-0">🥇</span>
                                  <div className="min-w-0">
                                    <div className="font-extrabold text-amber-950 truncate max-w-[170px] sm:max-w-[190px]">
                                      {firstWinner.participant?.name || 'Winner'}
                                    </div>
                                    <div className="text-[10px] font-bold text-amber-800/80 truncate">
                                      {firstWinner.chestCode ? `#${firstWinner.chestCode}` : ''}
                                      {firstWinner.participant?.group?.name ? ` • ${firstWinner.participant.group.name}` : (firstWinner.participant?.groupName ? ` • ${firstWinner.participant.groupName}` : '')}
                                    </div>
                                  </div>
                                </div>
                                <span className="font-mono font-black text-amber-700 text-xs shrink-0">
                                  +{firstWinner.pointsAwarded} pts
                                </span>
                              </div>
                            ) : null}

                            {/* 2nd Place */}
                            {secondWinner ? (
                              <div className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-base leading-none shrink-0">🥈</span>
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-800 truncate max-w-[170px] sm:max-w-[190px]">
                                      {secondWinner.participant?.name || 'Winner'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium truncate">
                                      {secondWinner.chestCode ? `#${secondWinner.chestCode}` : ''}
                                      {secondWinner.participant?.group?.name ? ` • ${secondWinner.participant.group.name}` : (secondWinner.participant?.groupName ? ` • ${secondWinner.participant.groupName}` : '')}
                                    </div>
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-slate-600 text-xs shrink-0">
                                  +{secondWinner.pointsAwarded} pts
                                </span>
                              </div>
                            ) : null}

                            {/* 3rd Place */}
                            {thirdWinner ? (
                              <div className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-xl bg-amber-900/5 border border-amber-900/15">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-base leading-none shrink-0">🥉</span>
                                  <div className="min-w-0">
                                    <div className="font-bold text-amber-900 truncate max-w-[170px] sm:max-w-[190px]">
                                      {thirdWinner.participant?.name || 'Winner'}
                                    </div>
                                    <div className="text-[10px] text-amber-800/70 font-medium truncate">
                                      {thirdWinner.chestCode ? `#${thirdWinner.chestCode}` : ''}
                                      {thirdWinner.participant?.group?.name ? ` • ${thirdWinner.participant.group.name}` : (thirdWinner.participant?.groupName ? ` • ${thirdWinner.participant.groupName}` : '')}
                                    </div>
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-amber-800 text-xs shrink-0">
                                  +{thirdWinner.pointsAwarded} pts
                                </span>
                              </div>
                            ) : null}

                            {!firstWinner && !secondWinner && !thirdWinner && (
                              <div className="py-2 text-center text-xs text-slate-400">
                                Winner details published
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Card Action */}
                        <div className="w-full pt-3.5 flex items-center justify-between border-t border-slate-100 text-slate-500 font-medium">
                          <span className="capitalize text-xs font-semibold text-slate-400">
                            {isGroup ? '👥 Group Event' : '👤 Individual'}
                          </span>
                          <span className="text-xs font-extrabold text-sky-600 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            View Full Result & Poster &rarr;
                          </span>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Empty State */}
            {data.length === 0 && (
              <GlassCard className="text-center py-20 bg-white border border-slate-200 shadow-sm rounded-3xl" hover={false}>
                <div className="max-w-md mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-400 mb-4">
                    🔍
                  </div>
                  <h4 className="font-extrabold text-lg text-slate-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    No Published Results Found
                  </h4>
                  <p className="text-sm text-slate-500 mb-6">
                    {debouncedSearch || categoryFilter
                      ? 'No results matched your search or category filter criteria.'
                      : 'Official competition results will appear here once published by the fest jury.'}
                  </p>
                  {(debouncedSearch || categoryFilter) && (
                    <button
                      onClick={handleResetFilters}
                      className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-sky-600 text-white hover:bg-sky-500 transition-all shadow-md shadow-sky-600/20 cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </GlassCard>
            )}

            {/* Pagination Controls */}
            {total > PAGE_SIZE && (
              <div className="flex justify-center items-center mt-12 py-4">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={PAGE_SIZE}
                  onChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  showSizeChanger={false}
                  showTotal={(tot, range) => (
                    <span className="text-xs font-bold text-slate-500">
                      {range[0]}-{range[1]} of {tot} results
                    </span>
                  )}
                  className="custom-pagination font-semibold"
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


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { Spin, Avatar } from 'antd';
import { TrophyFilled, FireFilled, FullscreenOutlined, FullscreenExitOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import apiClient from '../../services/apiClient';
import { LatticeBackground, LiveBadge } from '../../components/publiccomponents/DesignSystem';

const barColors = ['#0284C7', '#0F4C3A', '#D97706', '#7C3AED', '#EC4899', '#10B981'];

const ProAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'overall' | 'group' | 'subJunior' | 'junior' | 'senior'>('overall');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');

  // Fetch full pro analytics payload
  const fetchProData = async () => {
    try {
      const res = await apiClient.get('/public/dashboard/pro-analytics');
      setData(res.data);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch exact filtered graph aggregation
  const fetchFilteredGraph = async (currentFilter: string) => {
    try {
      const res = await apiClient.get('/public/dashboard/group-analytics', { params: { filter: currentFilter } });
      const formatted = res.data.map((g: any, idx: number) => ({
        name: g.name,
        points: g.points || 0,
        trend: Math.round((g.points || 0) * (0.85 + (idx % 3) * 0.1)),
      }));
      setChartData(formatted);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    }
  };

  const handleGlobalRefresh = () => {
    fetchProData();
    fetchFilteredGraph(filter);
  };

  // Initial load & socket live updation
  useEffect(() => {
    fetchProData();
    fetchFilteredGraph(filter);

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const socket = io(socketUrl);

    socket.on('points:updated', handleGlobalRefresh);
    socket.on('result:published', handleGlobalRefresh);
    socket.on('competitions:updated', handleGlobalRefresh);
    socket.on('final:announced', handleGlobalRefresh);

    const interval = setInterval(handleGlobalRefresh, 10000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    fetchFilteredGraph(filter);
  }, [filter]);

  // Cleanup unmount fullscreen exit
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const handleNavigateHome = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    navigate('/');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col items-center justify-center">
        <Spin size="large" />
        <p className="mt-4 text-sky-600 font-mono font-bold tracking-widest uppercase text-xs">Loading Scoreboard...</p>
      </div>
    );
  }

  const groups = data?.groups || [];
  const matrix = data?.matrix || [];
  const topStudents = data?.topStudents || [];
  const ongoing = data?.ongoing || [];
  const recentResults = data?.recentResults || [];
  const leaderGroup = groups[0];
  const maxPoints = Math.max(...groups.map((g: any) => g.totalPoints || 0), 1);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 p-3 md:p-5 font-body select-none relative overflow-hidden flex flex-col justify-between">
      {/* Soft background lattice */}
      <LatticeBackground opacity={0.03} parallax={false} />

      {/* ── COMPACT TOP CONTROL BAR ── */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 via-teal-600 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                Jeelani Fest 2026 Pro Scoreboard
              </h1>
              <LiveBadge label="PRO ARENA" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">
              Sheikh Jeelani Academy • Real-Time Auditorium Screen Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block mr-2">
            <div className="font-mono text-[9px] uppercase font-bold text-sky-700">LAST SYNC</div>
            <div className="font-mono text-xs text-slate-900 font-extrabold">{lastSync || 'Just Now'}</div>
          </div>

          <button
            onClick={handleNavigateHome}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-[11px] uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
          >
            <HomeOutlined className="text-sky-600 font-bold" /> Home
          </button>

          <button
            onClick={handleGlobalRefresh}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-sky-600 transition-all shadow-sm text-xs"
            title="Refresh Data"
          >
            <ReloadOutlined />
          </button>

          <button
            onClick={toggleFullscreen}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md hover:bg-slate-800 transition-all flex items-center gap-1.5"
          >
            {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* ── MAIN DASHBOARD ARENA GRID (COMPACT NON-SCROLLABLE FIT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 flex-1">
        
        {/* LEFT COLUMN: LEADERBOARD & HOUSE STANDINGS (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Leading Champion Card */}
          {leaderGroup && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-white border-2 border-amber-400 shadow-sm relative overflow-hidden shrink-0">
              <div className="absolute top-2 right-3 font-mono font-black text-4xl text-amber-500/15 pointer-events-none">#1</div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 shadow-sm">
                  🏆 Championship Leader
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-600 border-2 border-amber-300 shadow-md flex items-center justify-center font-extrabold text-2xl text-white shrink-0 overflow-hidden">
                  {leaderGroup.logoUrl ? (
                    <img src={leaderGroup.logoUrl} alt={leaderGroup.name} className="w-full h-full object-cover" />
                  ) : (
                    leaderGroup.name.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                    {leaderGroup.name}
                  </h2>
                  <div className="font-mono text-2xl font-black text-sky-600">
                    {leaderGroup.totalPoints} <span className="text-[10px] font-sans font-bold text-slate-500">PTS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* House Standings List */}
          <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-sky-700 mb-2 flex items-center justify-between">
              <span>Overall House Standings</span>
              <TrophyFilled className="text-amber-500" />
            </h3>

            <div className="space-y-2.5 flex-1 justify-center flex flex-col">
              {groups.map((group: any, idx: number) => {
                const pts = group.totalPoints || 0;
                const pct = Math.max((pts / maxPoints) * 100, 5);

                return (
                  <div key={group._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          #{idx + 1}
                        </span>

                        {group.logoUrl ? (
                          <img src={group.logoUrl} alt={group.name} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <Avatar size={24} style={{ backgroundColor: barColors[idx % barColors.length], fontWeight: 'bold', fontSize: 10 }}>
                            {group.name.charAt(0)}
                          </Avatar>
                        )}

                        <span className="font-extrabold text-slate-900">{group.name}</span>
                      </div>

                      <div className="font-mono text-sm font-black text-sky-600">{pts} pts</div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: barColors[idx % barColors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: BIAXIAL GRAPH & CATEGORY RADAR (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Main Score Biaxial Graph */}
          <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-sky-700">
                Filtered Score Graph
              </h3>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold">
                {[
                  { id: 'overall', label: 'Overall' },
                  { id: 'group', label: 'Group' },
                  { id: 'subJunior', label: 'Sub-Jr' },
                  { id: 'junior', label: 'Junior' },
                  { id: 'senior', label: 'Senior' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilter(t.id as any)}
                    className={`px-2.5 py-0.5 rounded-md uppercase transition-all ${
                      filter === t.id ? 'bg-sky-600 text-white font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fill: '#0F172A', fontSize: 10, fontWeight: 700 }} />
                  <YAxis yAxisId="left" orientation="left" tick={{ fill: '#0284C7', fontSize: 10, fontWeight: 700 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#D97706', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      color: '#0F172A',
                      fontSize: 11,
                    }}
                  />
                  <Bar yAxisId="left" dataKey="points" radius={[6, 6, 0, 0]} barSize={26}>
                    {chartData.map((_: any, idx: number) => (
                      <Cell key={idx} fill={barColors[idx % barColors.length]} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="trend" stroke="#D97706" strokeWidth={2.5} dot={{ r: 3, fill: '#D97706' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Strength Radar Spider Chart */}
          <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-sky-700 mb-1">
              Category Matrix Radar
            </h3>

            <div style={{ width: '100%', height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="70%" data={matrix}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#0F172A', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis stroke="#94A3B8" />
                  <Radar name="Sub Junior" dataKey="subJunior" stroke="#0284C7" fill="#0284C7" fillOpacity={0.25} />
                  <Radar name="Junior" dataKey="junior" stroke="#D97706" fill="#D97706" fillOpacity={0.25} />
                  <Radar name="Senior" dataKey="senior" stroke="#10B981" fill="#10B981" fillOpacity={0.25} />
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#0F172A', fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ONGOING EVENTS & RECENT RESULTS TICKER (3 COLS) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Live Stage Events Ticker */}
          <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ON AIR STAGES
              </h3>
              <span className="text-[9px] font-bold text-slate-500 font-mono">{ongoing.length} Active</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {ongoing.map((ev: any) => (
                <div key={ev._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-extrabold text-slate-900 line-clamp-1">{ev.name}</div>
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase mt-1 text-slate-500">
                    <span className="text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">{ev.category}</span>
                    <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-100">STAGE {ev.stage || '1'}</span>
                  </div>
                </div>
              ))}
              {ongoing.length === 0 && (
                <div className="py-6 text-center text-[10px] text-slate-400 font-medium">No live programs right now.</div>
              )}
            </div>
          </div>

          {/* Recent Published Results Ticker */}
          <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm flex-1">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 mb-2 flex items-center gap-1.5">
              <FireFilled /> Recent Published Winners
            </h3>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {recentResults.map((res: any) => {
                const winner = res.winners?.[0];
                return (
                  <div key={res._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wide line-clamp-1">{res.competition?.name}</div>
                    {winner && (
                      <div className="text-[11px] font-bold text-slate-900 mt-0.5 flex justify-between items-center">
                        <span className="line-clamp-1">🥇 {winner.participant?.name || 'Winner'}</span>
                        <span className="text-sky-600 font-mono shrink-0 ml-1">+{winner.pointsAwarded} pts</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {recentResults.length === 0 && (
                <div className="py-6 text-center text-[10px] text-slate-400 font-medium">No results published yet.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── BOTTOM INDIVIDUAL CHAMPIONS SHOWCASE TICKER (COMPACT) ── */}
      <div className="mt-3 pt-3 border-t border-slate-200 relative z-10 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 mr-2">
            Top Performers 🏆
          </span>
          {topStudents.map((st: any, idx: number) => (
            <div key={st._id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm shrink-0">
              <span className="w-5 h-5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-extrabold flex items-center justify-center font-mono border border-sky-100">
                #{idx + 1}
              </span>
              <Avatar src={st.profileImage} size={22} style={{ backgroundColor: '#0284C7', fontWeight: 'bold', fontSize: 10 }}>
                {st.name.charAt(0)}
              </Avatar>
              <div className="text-[11px] font-extrabold text-slate-900 whitespace-nowrap">{st.name}</div>
              <div className="font-mono text-[11px] font-black text-sky-600">{st.points} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProAnalytics;

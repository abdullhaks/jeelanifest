import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import apiClient from '../../services/apiClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import CountUp from 'react-countup';
import {
  LatticeBackground, GlassCard, BentoGrid, BentoCell,
  LiveBadge, SectionHeading, BrassDivider, FloatingPillTag,
} from '../../components/publiccomponents/DesignSystem';
import { useModalStore } from '../../store/modalStore';
import { GroupDetailModal } from '../../components/publiccomponents/GroupDetailModal';
import { CircularGallery } from '../../components/publiccomponents/CircularGallery';
import { MagicCard, MagicBento } from '../../components/publiccomponents/MagicBento';
import { Trophy, Award, Users, Image as ImageIcon, BarChart3, Compass, Crown, Star } from 'lucide-react';

const groupColors = ['#0284C7', '#10B981', '#D97706', '#7C3AED', '#EC4899', '#06B6D4', '#8B5CF6'];

const CustomMilestoneTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const compName = payload[0]?.payload?.competitionName || '';
    return (
      <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xl min-w-[200px] z-50">
        <div className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex flex-col">
          <span className="text-sky-600 font-mono text-xs">{label} Milestone</span>
          <span className="text-slate-500 font-medium text-[11px] truncate max-w-[220px]">{compName}</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between text-xs font-bold gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-700 font-extrabold">{entry.name}:</span>
              </div>
              <span className="font-mono text-slate-900 font-black">{entry.value} pts</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Safe CountUp component resolution for Vite ESM
const CountUpComp: any = (CountUp as any)?.default || CountUp;

/* ── Hero slide data ── */
const slides = [
  {
    id: 1,
    image: 'hero1.JPEG',
    en: 'Art Without Limits',
    ar: 'فن بلا حدود',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
    en: 'Voices of Tomorrow',
    ar: 'أصوات الغد',
  },
  {
    id: 3,
    image: 'hero2.JPEG',
    en: 'Unleash Your Passion',
    ar: 'أطلق العنان لشغفك',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop',
    en: 'Unleash Your Passion',
    ar: 'أطلق العنان لشغفك',
  },
];

const coordinatorMembers = [
  {
    id: 1,
    name: 'SHEIKH MUHAMMED ABDUL MAJEED HUDAWI. POONGOD',
    role: 'CHAIRMAN JEELANI FEST 26',
    isChairman: true,
    photo: 'https://res.cloudinary.com/mqorn88v/image/upload/v1786117104/mj_nk2rhe.png',
    tag: 'Executive Chairman',
    bio: 'Chief orchestrator and executive vision leader of Jeelani Fest 2026.',
  },
  {
    id: 2,
    name: 'Muhammed Nameer Jeelani. Valapuram',
    role: 'GENERAL CONVENOR JEELANI FEST 26',
    isChairman: false,
    photo: 'https://res.cloudinary.com/mqorn88v/image/upload/v1786117310/ChatGPT_Image_Aug_7_2026_09_11_04_PM_kzhbnf.png',
    tag: 'Convener',
  },
  {
    id: 3,
    name: 'Gulam Muhammed Sharafullah Jeelani. Valapuram',
    role: 'JOIN CONVENIR JEELANI FEST 26',
    isChairman: false,
    photo: 'https://res.cloudinary.com/mqorn88v/image/upload/v1786116891/gulam_ypk2lc.jpg',
    tag: 'Advisory Lead',
  },
  {
    id: 4,
    name: 'AliShan Shad Jeelani .Manjery',
    role: 'JOIN CONVENIR JEELANI FEST 26',
    isChairman: false,
    photo: 'https://res.cloudinary.com/mqorn88v/image/upload/v1786116892/WhatsApp_Image_2026-08-07_at_8.43.06_PM_bevxlj.jpg',
    tag: 'Stage Operations',
  },
  {
    id: 5,
    name: 'Adhil sulaiman. Ponnani',
    role: 'PROGRAM COORDINATOR JEELANI FEST 26',
    isChairman: false,
    photo: 'https://res.cloudinary.com/mqorn88v/image/upload/v1786116892/adil_b1v0ce.jpg',
    tag: 'Finance & Assets',
  },
  {
    id: 6,
    name: 'Ali  Zainul Abideen. Wayanad',
    role: 'PROGRAM COORDINATOR JEELANI FEST 26',
    isChairman: false,
    photo: 'https://res.cloudinary.com/mqorn88v/image/upload/v1786117487/ChatGPT_Image_Aug_7_2026_09_14_38_PM_myrfvn.png',
    tag: 'Media & Branding',
  },
  {
    id: 7,
    name: 'Ahammed Fairooz. Valyora',
    role: 'PROGRAMME COORDINATOR JEELANI FEST 26',
    isChairman: false,
    photo: 'https://res.cloudinary.com/mqorn88v/image/upload/v1786118139/ChatGPT_Image_Aug_7_2026_09_25_27_PM_vchunb.png',
    tag: 'Student Affairs',
  },
];

/* ── Animated Counter Component ── */
const AnimatedStat: React.FC<{ value: number; label: string; color?: string }> = ({ value, label, color = '#0284C7' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="text-center">
      <div className="font-mono font-extrabold text-4xl md:text-5xl lg:text-6xl mb-2" style={{ color, fontVariantNumeric: 'tabular-nums' }}>
        {isInView ? <CountUpComp end={value} duration={2.5} separator="," /> : '0'}
      </div>
      <div className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">
        {label}
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const openLiveModal = useModalStore(state => state.openLiveModal);
  
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [ongoingPrograms, setOngoingPrograms] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overall');
  const [chartFilter, setChartFilter] = useState<'overall' | 'group' | 'subJunior' | 'junior' | 'senior'>('overall');
  const [stats, setStats] = useState({ groupCount: 0, studentCount: 0, competitionCount: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);

  // Selected Group Modal
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  // Selected Student Modal
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  const fetchGroups = () => apiClient.get('/public/dashboard/groups').then(res => setGroups(res.data));
  const fetchStudents = () => apiClient.get('/public/dashboard/students').then(res => setStudents(res.data));
  const fetchOngoing = () => apiClient.get('/public/dashboard/ongoing-programs').then(res => setOngoingPrograms(res.data));
  const fetchStats = () => apiClient.get('/public/dashboard/stats').then(res => setStats(res.data));
  const [chartGroups, setChartGroups] = useState<any[]>([]);
  const [chartMilestones, setChartMilestones] = useState<any[]>([]);
  const [galleryShowcaseItems, setGalleryShowcaseItems] = useState<any[]>([]);

  const fetchGalleryShowcase = () => {
    apiClient.get('/public/gallery?limit=10')
      .then(res => {
        const raw = res.data?.data || res.data || [];
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((item: any, idx: number) => ({
            id: item._id || item.id || idx,
            image: item.imageUrl || item.url || item.image,
            title: item.title || item.competition?.name || 'Fest Highlight',
            caption: item.description || (item.competition ? item.competition.name : 'Jeelani Fest 2026 Visual Moment'),
            category: item.category || (item.competition ? 'Competition' : 'Event Gallery'),
          }));
          setGalleryShowcaseItems(mapped);
        }
      })
      .catch(err => console.error('Error fetching showcase gallery:', err));
  };

  const fetchChartData = (filter: string) => {
    apiClient.get('/public/dashboard/group-analytics', { params: { filter } })
      .then(res => {
        if (res.data) {
          setChartGroups(res.data.groups || []);
          setChartMilestones(res.data.milestones || []);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchGroups();
    fetchStudents();
    fetchOngoing();
    fetchStats();
    fetchChartData(chartFilter);
    fetchGalleryShowcase();

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const socket = io(socketUrl);

    const handleGlobalUpdate = () => {
      fetchGroups();
      fetchStudents();
      fetchOngoing();
      fetchStats();
      fetchChartData(chartFilter);
      fetchGalleryShowcase();
    };

    socket.on('points:updated', handleGlobalUpdate);
    socket.on('result:published', handleGlobalUpdate);
    socket.on('competitions:updated', handleGlobalUpdate);
    socket.on('final:announced', handleGlobalUpdate);

    window.addEventListener('refresh-graphs', handleGlobalUpdate);

    return () => {
      socket.disconnect();
      window.removeEventListener('refresh-graphs', handleGlobalUpdate);
    };
  }, [chartFilter]);

  // Auto-rotate hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const filteredStudents = (() => {
    const categories = ['subJunior', 'junior', 'senior'];
    
    if (activeTab === 'overall') {
      const topPerCategory: any[] = [];
      categories.forEach(cat => {
        const topInCat = students
          .filter(s => {
            const sCat = (s.category || '').toLowerCase().replace(/\s+/g, '');
            const cName = cat.toLowerCase();
            return sCat === cName;
          })
          .sort((a, b) => (b.points || 0) - (a.points || 0))[0];
        if (topInCat) topPerCategory.push(topInCat);
      });
      return topPerCategory.sort((a, b) => (b.points || 0) - (a.points || 0));
    } else {
      const targetCat = activeTab.toLowerCase().replace(/\s+/g, '');
      const matched = students
        .filter(s => (s.category || '').toLowerCase().replace(/\s+/g, '') === targetCat)
        .sort((a, b) => (b.points || 0) - (a.points || 0));
      return matched.slice(0, 1);
    }
  })();

  const handleOpenGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setGroupModalOpen(true);
  };

  const handleOpenStudentDetail = (student: any) => {
    setSelectedStudent(student);
    setStudentModalOpen(true);
  };

  return (
    <div className="bg-[#F8F9FA] text-slate-900 min-h-screen">
      {/* ═══════════════════════════════════════
          HERO SECTION — Light Parallax + Centralised Title
         ═══════════════════════════════════════ */}
      <section className="relative w-full h-[85vh] overflow-hidden bg-slate-900">
        {/* Background image with parallax */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            />
          </AnimatePresence>
        </motion.div>

        {/* Soft dark gradient Scrim over imagery */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/40 to-[#F8F9FA]" />
        
        {/* Lattice overlay */}
        <LatticeBackground opacity={0.06} />

        {/* Hero Content */}
        <motion.div
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 pt-16"
          style={{ opacity: heroOpacity }}
        >
          {/* Centralised Arabic fest name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            dir="rtl"
            className="font-display-ar text-amber-300 text-5xl md:text-7xl lg:text-8xl drop-shadow-md text-center"
          >
            مهرجان الجيلاني
          </motion.h1>

          {/* Centralised English fest name */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-display text-white text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-widest uppercase mt-2 drop-shadow-md text-center"
          >
            Jeelani Fest 2026
          </motion.h2>

          {/* Slide tagline */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="mt-4 text-base md:text-xl text-slate-200 font-medium text-center"
            >
              {slides[currentSlide].en}
            </motion.p>
          </AnimatePresence>

          {/* Slide indicators */}
          <div className="flex gap-2.5 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className="transition-all duration-300"
                style={{
                  width: currentSlide === i ? '32px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: currentSlide === i ? '#38BDF8' : 'rgba(255, 255, 255, 0.4)',
                }}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── QUICK DIRECT NAVIGATION SHORTCUTS BAR (Compact Mobile & Desktop) ── */}
      <div className="relative z-30 max-w-4xl mx-auto px-4 -mt-8 mb-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md rounded-xl p-2 sm:p-3"
        >
          <div className="flex items-center mb-1.5 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Compass size={12} className="text-sky-600 animate-spin-slow" />
              Explore
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
            {[
              { name: 'Groups', path: '/groups', icon: <Trophy size={15} />, bg: 'bg-gradient-to-tr from-amber-500 to-yellow-400' },
              { name: 'Results', path: '/results', icon: <Award size={15} />, bg: 'bg-gradient-to-tr from-emerald-500 to-teal-400' },
              { name: 'Participants', path: '/participants', icon: <Users size={15} />, bg: 'bg-gradient-to-tr from-sky-500 to-blue-600' },
              { name: 'Gallery', path: '/festgallery', icon: <ImageIcon size={15} />, bg: 'bg-gradient-to-tr from-purple-500 to-indigo-500' },
              { name: 'Pro Arena', path: '/analytics', icon: <BarChart3 size={15} />, bg: 'bg-gradient-to-tr from-rose-500 to-pink-500' },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg bg-slate-50 hover:bg-sky-50/80 border border-slate-100/90 hover:border-sky-200 group transition-all transform hover:-translate-y-0.5 active:scale-95 text-center cursor-pointer"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${item.bg} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform mb-1`}>
                  {item.icon}
                </div>
                <span className="text-[9px] sm:text-[11px] font-extrabold text-slate-800 group-hover:text-sky-600 line-clamp-1">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════
          MAIN BENTO GRID (SPOTS 1, 2, 3)
         ═══════════════════════════════════════ */}
      <div className="max-w-7xl w-full mx-auto px-6 py-16 space-y-16 relative">
        <LatticeBackground opacity={0.03} parallax={false} />

        {/* ── SPOT 1, 2, 3 Bento Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* SPOT 1: ONGOING PROGRAMS WITH REALTIME UPDATES (4 COLS) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <SectionHeading title="Now Playing" titleAr="جارٍ الآن" centered={false} className="mb-0" />
              <LiveBadge label="ON AIR" />
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {ongoingPrograms.map(prog => (
                  <motion.div
                    key={prog._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <GlassCard 
                      className="p-5 cursor-pointer bg-white border border-slate-200 hover:border-sky-300 shadow-sm transition-all hover:scale-[1.02]" 
                      hover={true} 
                      onClick={() => openLiveModal(prog._id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-extrabold text-base text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                          {prog.name}
                        </h3>
                        <span className="live-badge text-[9px] px-2 py-0.5 shrink-0">LIVE</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 mb-3">
                        <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold">{prog.category}</span>
                        <span>{prog.type || 'Event'}</span>
                      </div>
                      {prog.stage && (
                        <div className="px-3 py-1.5 rounded-xl text-xs font-extrabold w-full text-center bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> STAGE: {prog.stage}
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
              {ongoingPrograms.length === 0 && (
                <GlassCard className="py-16 text-center bg-white/80 border border-slate-200" hover={false}>
                  <p className="text-sm text-slate-400 font-medium">
                    No active stage events running right now.
                  </p>
                </GlassCard>
              )}
            </div>
          </div>

          {/* SPOT 2: BIAXIAL LINE CHART WITH MOVING FILTER TABS (8 COLS) */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <SectionHeading title="Live Group Points Graph" titleAr="رسم بياني للمجموعات" centered={false} className="mb-0" />
              <LiveBadge label="BIAXIAL LIVE" />
            </div>

            <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm flex-1 flex flex-col justify-between" hover={false}>
              {/* Moving Filter Tabs (Overall, Group Items, Sub Junior, Junior, Senior) */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 mb-6">
                {[
                  { id: 'overall', label: 'Overall' },
                  { id: 'group', label: 'Group Items' },
                  { id: 'subJunior', label: 'Sub Junior' },
                  { id: 'junior', label: 'Junior' },
                  { id: 'senior', label: 'Senior' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setChartFilter(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition-all relative ${
                      chartFilter === tab.id
                        ? 'text-slate-900 bg-white shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Milestone Multi-Line Chart */}
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartMilestones} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="milestone" 
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)' }} 
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis 
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <Tooltip content={<CustomMilestoneTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: 'bold' }}
                      iconType="circle"
                    />
                    {chartGroups.map((group: any, idx: number) => (
                      <Line
                        key={group._id}
                        type="monotone"
                        dataKey={group._id}
                        name={group.name}
                        stroke={groupColors[idx % groupColors.length]}
                        strokeWidth={3}
                        dot={{ r: 4, stroke: groupColors[idx % groupColors.length], strokeWidth: 2, fill: '#FFFFFF' }}
                        activeDot={{ r: 8, stroke: groupColors[idx % groupColors.length], strokeWidth: 2, fill: groupColors[idx % groupColors.length] }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          

        </div>

        <BrassDivider />

        {/* ── REACT BITS CIRCULAR GALLERY SECTION ── */}
        <section className="relative z-10">
          <SectionHeading
            title="Event Showcase Gallery"
            titleAr="معرض اللحظات المميزة"
            subtitle="Curated 3D circular highlight reel of live festival events. Click any photo to open full gallery."
            centered={true}
          />

          <CircularGallery
            items={galleryShowcaseItems}
            onItemClick={() => navigate('/festgallery')}
          />
        </section>

        {/* SPOT 3: NAVIGATE TO FEST GALLERY BANNER (FULL WIDTH / 12 COLS) */}
          <div className="lg:col-span-12">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-3xl overflow-hidden relative min-h-[220px] bg-slate-900 text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-lg cursor-pointer border border-slate-800 group"
              onClick={() => navigate('/festgallery')}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&fit=crop)' }} 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

              <div className="relative z-10 max-w-xl text-center md:text-left mb-6 md:mb-0">
                <FloatingPillTag label="Official Gallery & Posters" className="mb-4 inline-block" />
                <h3 className="text-3xl md:text-5xl font-extrabold leading-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Explore 50+ Visual Fest Moments & Posters
                </h3>
                <p className="text-sm text-slate-300 mt-3 font-medium">
                  Immerse in the artistic gallery, stage highlights, and official program posters.
                </p>
              </div>

              <div className="relative z-10 shrink-0">
                <button className="px-8 py-4 rounded-full font-extrabold text-sm bg-sky-500 text-white hover:bg-sky-400 shadow-lg hover:shadow-sky-500/25 transition-all flex items-center gap-2 group-hover:translate-x-1">
                  Open Fest Gallery &rarr;
                </button>
              </div>
            </motion.div>
          </div>

        <BrassDivider />

        {/* ── REACT BITS MAGIC BENTO SECTION (Main Programs & Striking Text) ── */}
        <section className="relative z-10">
          <SectionHeading
            title="Featured Art Programs"
            titleAr="البرامج الفنية البارزة"
            subtitle="Interactive program spotlight with striking visual typography."
            centered={true}
          />

          <MagicBento className="lg:grid-cols-3">
            <MagicCard
              tag="Stage Highlight"
              badge="Senior Finals"
              title="Qira'at & Quranic Recitation"
              subtitle="Masterful vocal resonance and Arabic tajweed articulation in front of grand judges."
              image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&fit=crop"
              className="lg:col-span-2 min-h-[300px]"
            />
            <MagicCard
              tag="Art Competition"
              badge="Sub Junior"
              title="Islamic Calligraphy & Canvas"
              subtitle="Traditional Kufic, Naskh & Thuluth ink calligraphy crafting intricate manuscript art."
              gradient="from-emerald-500/20 via-teal-500/10 to-transparent"
              className="min-h-[300px]"
            />
            <MagicCard
              tag="Linguistic"
              badge="Junior Category"
              title="Elocution & Arabic Oratory"
              subtitle="Eloquence, persuasive debate, and expressive speeches across Malayalam, English & Arabic."
              gradient="from-amber-500/20 via-orange-500/10 to-transparent"
              className="min-h-[280px]"
            />
            <MagicCard
              tag="Stage Drama"
              badge="Open Event"
              title="Daffmuttu & Cultural Chorus"
              subtitle="Rhythmic traditional Kerala Islamic folk percussion and harmonious choral performances."
              image="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&fit=crop"
              className="lg:col-span-2 min-h-[280px]"
            />
          </MagicBento>
        </section>

        <BrassDivider />

        {/* ── Artistic Talent Race ── */}
        <section className="relative z-10">
          <SectionHeading title="Artistic Talent Race" titleAr="سباق المواهب الفنية" subtitle="Top-performing students across all categories." centered={true} />

          {/* Filter category tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-full border border-slate-200">
              {[
                { key: 'overall', label: 'Overall Best' },
                { key: 'sub junior', label: 'Sub Junior' },
                { key: 'junior', label: 'Junior' },
                { key: 'senior', label: 'Senior' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase transition-all ${
                    activeTab === t.key ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard 
                    className="p-5 flex items-center justify-between bg-white border border-slate-200 shadow-sm hover:border-sky-300 transition-all cursor-pointer hover:scale-[1.02]"
                    onClick={() => handleOpenStudentDetail(student)}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        {student.profileImage ? (
                          <img
                            src={student.profileImage}
                            alt={student.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                        )}
                        <span
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-black shadow-sm"
                          style={{
                            background: index === 0 ? '#FEF3C7' : index === 1 ? '#F1F5F9' : index === 2 ? '#FFEDD5' : '#F8FAFC',
                            color: index === 0 ? '#D97706' : index === 1 ? '#475569' : index === 2 ? '#C2410C' : '#94A3B8',
                            border: `1px solid ${index === 0 ? '#FDE68A' : index === 1 ? '#E2E8F0' : index === 2 ? '#FDBA74' : '#E2E8F0'}`,
                          }}
                        >
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                          {student.name}
                        </h3>
                        <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                          {student.category && (
                            <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 text-[10px] font-extrabold uppercase border border-sky-100">
                              {student.category}
                            </span>
                          )}
                          <span>{student.group?.name || student.groupName || 'House Member'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-extrabold text-sky-600">{student.points}</div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Pts</div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredStudents.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 font-medium">
                No students with points in this category yet.
              </div>
            )}
          </div>
        </section>

        <BrassDivider />

        {/* ── Follow the Battle of the Champion Section ── */}
        <section className="relative z-10 my-4">
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-emerald-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-sky-500/20">
            <div className="relative z-10 max-w-2xl">
              <LiveBadge label="PRO SCOREBOARD" />
              <h2 className="text-3xl md:text-5xl font-black mt-3 mb-3 text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Follow the Battle of the Champions
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Experience real-time live scoring, biaxial performance trends, and category breakdown analytics in our Pro Scoreboard portal.
              </p>
            </div>
            <button
              onClick={() => navigate('/pro-analytics')}
              className="relative z-10 px-8 py-4 rounded-full font-extrabold text-sm bg-sky-500 hover:bg-sky-400 text-white shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              View Live Results &rarr;
            </button>
          </div>
        </section>

        <BrassDivider />

        {/* ── Centralised Contenders Section (With Team Logo Support) ── */}
        <section className="relative z-10">
          <SectionHeading
            title="The Contenders"
            titleAr="المتنافسون"
            subtitle="Discover the competing houses fighting for the grand championship. Click to view roster."
            centered={true}
          />

          <BentoGrid className="lg:grid-cols-4 gap-6">
            {groups.map((group) => {
              const groupLogo = group.logoUrl || group.logo || group.image;
              return (
                <BentoCell key={group._id}>
                  <GlassCard 
                    className="p-8 text-center flex flex-col items-center justify-center h-full bg-white border border-slate-200 shadow-sm hover:shadow-md cursor-pointer group"
                    onClick={() => handleOpenGroup(group._id)}
                  >
                    <div
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center font-extrabold text-3xl mb-4 shadow-md group-hover:scale-105 transition-transform overflow-hidden bg-gradient-to-tr from-sky-500 to-emerald-600 text-white border-2 border-slate-200"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {groupLogo ? (
                        <img src={groupLogo} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        group.name.charAt(0)
                      )}
                    </div>
                    <h3 className="font-extrabold text-xl mb-1 text-slate-900 group-hover:text-sky-600 transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                      {group.name}
                    </h3>
                    <div className="font-mono font-extrabold text-lg text-sky-600">
                      {group.points || group.totalPoints || 0} Points
                    </div>
                  </GlassCard>
                </BentoCell>
              );
            })}
          </BentoGrid>
        </section>

        <BrassDivider />

        {/* ── Goussiya Student Centre Section ── */}
        <section className="relative z-10">
          <SectionHeading
            title="Goussiya Student Centre"
            titleAr="مركز الغوثية الطلابي"
            subtitle="Introducing our vibrant Student Council — the driving force behind Jeelani Fest 2026."
            centered={true}
          />
          <GlassCard className="p-8 md:p-12 bg-white border border-slate-200 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-600 to-emerald-600 p-0.5 shadow-xl mb-4">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-4xl font-extrabold text-amber-400">
                    <img src="gsc.jpeg" alt="" className='w-full h-full object-cover rounded-xl' />
                  </div>
                </div>
                <h3 className="font-extrabold text-xl text-slate-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  Goussiya Student Centre
                </h3>
                <span className="text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                  Apex Student Council
                </span>
              </div>

              <div className="md:col-span-2 space-y-4 text-slate-600 text-sm leading-relaxed">
                <p>
                  The <strong className="text-slate-900">Goussiya Student Centre (GSC)</strong> is the official student council governing body dedicated to empowering youth, fostering leadership, and organizing grand cultural events like <em>Jeelani Fest 2026</em>.
                </p>
                <p>
                  Through visionary leadership and collaborative execution, GSC nurtures artistic talents, intellectual debate, and cultural heritage across all participating institutions.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700">
                    ✨ Student Governance
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700">
                    🎨 Cultural Co-ordination
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700">
                    🏆 Fair Play & Ethics
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        <BrassDivider />

        {/* ── ABOUT JEELANI FEST ── */}
        <section className="relative z-10 max-w-4xl mx-auto">
          <SectionHeading title="About Jeelani Fest" titleAr="عن مهرجان الجيلاني" centered={true} />
          <GlassCard className="p-8 md:p-12 bg-white border border-slate-200/90 shadow-sm text-center rounded-3xl" hover={false}>
            <p className="leading-relaxed mb-6 text-slate-700 text-base md:text-lg font-medium">
              Jeelani Fest 2026 is the ultimate celebration of art, culture, and competitive spirit. Bringing together the brightest minds and most talented individuals, it serves as a prestigious platform for students to unleash their passion across hundreds of diverse programs.
            </p>
            <p className="leading-relaxed text-slate-500 text-sm md:text-base">
              Rooted in tradition but looking towards the future, our festival is a testament to the power of creativity and the unifying force of artistic expression.
            </p>
          </GlassCard>
        </section>

        <BrassDivider />

        {/* ── MEET THE COORDINATORS (PREMIUM LEADERSHIP SHOWCASE - 7 MEMBERS) ── */}
        <section className="relative z-10 max-w-6xl mx-auto">
          <SectionHeading 
            title="Meet the Coordinators" 
            titleAr="فريق الإدارة والتنسيق" 
            subtitle="The executive organizing committee leading Jeelani Fest 2026 to victory."
            centered={true} 
          />

          {/* 1. PROGRAM CHAIRMAN FEATURED SPOTLIGHT CARD */}
          <div className="mb-8">
            {coordinatorMembers
              .filter(m => m.isChairman)
              .map(chairman => (
                <motion.div
                  key={chairman.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-400/50 shadow-2xl text-white">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10 text-center md:text-left">
                      {/* Avatar with golden halo ring & small golden crown */}
                      <div className="relative shrink-0">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-amber-400/90 shadow-xl shadow-amber-500/25 ring-4 ring-amber-400/30">
                          <img
                            src={chairman.photo}
                            alt={chairman.name}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-500 border-2 border-slate-950 shadow-lg flex items-center justify-center text-slate-950" title="Chairman">
                          <Crown size={16} className="fill-slate-950" />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest mb-2.5">
                          <Star size={12} className="fill-amber-300" />
                          Executive Leadership
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide break-words" style={{ fontFamily: 'var(--font-display)' }}>
                          {chairman.name}
                        </h3>
                        <p className="text-amber-400 font-extrabold text-sm sm:text-base uppercase tracking-widest mt-1">
                          {chairman.role}
                        </p>
                        <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl font-medium leading-relaxed">
                          {chairman.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* 2. GRID OF 6 KEY COORDINATOR MEMBERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {coordinatorMembers
              .filter(m => !m.isChairman)
              .map((coord, idx) => (
                <motion.div
                  key={coord.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <GlassCard className="flex items-center gap-4 p-4 sm:p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all rounded-2xl group h-full">
                    <div className="relative shrink-0">
                      <img
                        src={coord.photo}
                        alt={coord.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-md group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-500 border border-white shadow-md flex items-center justify-center text-slate-950">
                        <Crown size={11} className="fill-slate-950" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-sky-600 transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                        {coord.name}
                      </h4>
                      <p className="text-xs uppercase tracking-wider font-extrabold text-sky-600 mt-1 leading-normal">
                        {coord.role}
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
          </div>
        </section>

        <BrassDivider />

        {/* ── Event Analytics Scoreboard ── */}
        <section className="relative z-10">
          <GlassCard className="p-12 md:p-16 text-center bg-white border border-slate-200 shadow-md" hover={false}>
            <LatticeBackground opacity={0.03} parallax={false} />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
              <AnimatedStat value={stats.groupCount} label="Competing Teams" color="#0F4C3A" />
              <AnimatedStat value={stats.competitionCount} label="Live Events" color="#0284C7" />
              <AnimatedStat value={stats.studentCount} label="Participants" color="#D97706" />
            </div>
          </GlassCard>
        </section>
      </div>

      {/* Group Detail Modal */}
      <GroupDetailModal
        groupId={selectedGroupId}
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
      />

      {/* Student Detail Modal (Artistic Talent Race) */}
      <AnimatePresence>
        {studentModalOpen && selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setStudentModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative text-slate-900 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors"
                onClick={() => setStudentModalOpen(false)}
              >
                ✕
              </button>

              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
                  {selectedStudent.profileImage ? (
                    <img src={selectedStudent.profileImage} alt={selectedStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedStudent.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                    {selectedStudent.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedStudent.chestNo && (
                      <span className="text-xs font-bold font-mono bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded border border-sky-100">
                        CHEST #{selectedStudent.chestNo}
                      </span>
                    )}
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      {selectedStudent.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Group Team</div>
                  <div className="font-bold text-slate-800 text-base">{selectedStudent.group?.name || selectedStudent.groupName || 'Individual'}</div>
                </div>
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-center">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-sky-600 mb-1">Total Score</div>
                  <div className="font-mono text-2xl font-black text-sky-600">{selectedStudent.points} PTS</div>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setStudentModalOpen(false)}
                  className="w-full py-3 rounded-full font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                >
                  Close Student Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

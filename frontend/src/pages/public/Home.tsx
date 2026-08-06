import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import apiClient from '../../services/apiClient';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CountUp from 'react-countup';
import {
  LatticeBackground, GlassCard, BentoGrid, BentoCell,
  LiveBadge, SectionHeading, BrassDivider, FloatingPillTag,
} from '../../components/publiccomponents/DesignSystem';
import { useModalStore } from '../../store/modalStore';
import { GroupDetailModal } from '../../components/publiccomponents/GroupDetailModal';
import { CircularGallery } from '../../components/publiccomponents/CircularGallery';
import { MagicCard, MagicBento } from '../../components/publiccomponents/MagicBento';

// Safe CountUp component resolution for Vite ESM
const CountUpComp: any = (CountUp as any)?.default || CountUp;

/* ── Hero slide data ── */
const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop',
    en: 'Unleash Your Passion',
    ar: 'أطلق العنان لشغفك',
  },
];

const dummyCoordinators = [
  { name: 'Ahmad Abdullah', role: 'Chief Organizer', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
  { name: 'Fatima Zahra', role: 'Stage Manager', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
  { name: 'Zayed Hassan', role: 'Creative Director', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
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
  const [posters, setPosters] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Selected Group Modal
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const fetchGroups = () => apiClient.get('/public/dashboard/groups').then(res => setGroups(res.data));
  const fetchStudents = () => apiClient.get('/public/dashboard/students').then(res => setStudents(res.data));
  const fetchOngoing = () => apiClient.get('/public/dashboard/ongoing-programs').then(res => setOngoingPrograms(res.data));
  const fetchStats = () => apiClient.get('/public/dashboard/stats').then(res => setStats(res.data));
  const fetchPosters = () => apiClient.get('/posters?limit=6').then(res => setPosters(res.data.data));
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchChartData = (filter: string) => {
    apiClient.get('/public/dashboard/group-analytics', { params: { filter } })
      .then(res => {
        const formatted = res.data.map((g: any, idx: number) => ({
          name: g.name,
          points: g.points || 0,
          trend: Math.round((g.points || 0) * (0.85 + (idx % 3) * 0.1)),
        }));
        setChartData(formatted);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchGroups();
    fetchStudents();
    fetchOngoing();
    fetchStats();
    fetchPosters();
    fetchChartData(chartFilter);

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const socket = io(socketUrl);

    const handleGlobalUpdate = () => {
      fetchGroups();
      fetchStudents();
      fetchOngoing();
      fetchStats();
      fetchChartData(chartFilter);
    };

    socket.on('points:updated', handleGlobalUpdate);
    socket.on('result:published', handleGlobalUpdate);
    socket.on('competitions:updated', handleGlobalUpdate);
    socket.on('final:announced', handleGlobalUpdate);

    return () => {
      socket.disconnect();
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

  const maxGroupPoints = Math.max(...groups.map(g => g.points), 1);
  const filteredStudents = students.filter(s => activeTab === 'overall' || s.category.toLowerCase() === activeTab.toLowerCase()).slice(0, 10);

  const handleOpenGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setGroupModalOpen(true);
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

              {/* Biaxial Line / Composed Chart */}
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#0F172A', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)' }} 
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      tick={{ fill: '#0284C7', fontSize: 12, fontWeight: 700 }}
                      axisLine={{ stroke: '#0284C7' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tick={{ fill: '#D97706', fontSize: 12, fontWeight: 700 }}
                      axisLine={{ stroke: '#D97706' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 12,
                        color: '#0F172A',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar yAxisId="left" dataKey="points" fill="#0284C7" radius={[6, 6, 0, 0]} barSize={28} />
                    <Line yAxisId="right" type="monotone" dataKey="trend" stroke="#D97706" strokeWidth={3} dot={{ r: 5, fill: '#D97706' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

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

        </div>

        <BrassDivider />

        {/* ── REACT BITS CIRCULAR GALLERY SECTION ── */}
        <section className="relative z-10">
          <SectionHeading
            title="Event Showcase Gallery"
            titleAr="معرض اللحظات المميزة"
            subtitle="Curated 3D circular highlight reel of live festival events."
            centered={true}
          />

          <CircularGallery />
        </section>

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
                  <GlassCard className="p-5 flex items-center justify-between bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center font-mono text-lg font-bold shadow-sm"
                        style={{
                          background: index === 0 ? '#FEF3C7' : index === 1 ? '#F1F5F9' : index === 2 ? '#FFEDD5' : '#F8FAFC',
                          color: index === 0 ? '#D97706' : index === 1 ? '#475569' : index === 2 ? '#C2410C' : '#94A3B8',
                          border: `1px solid ${index === 0 ? '#FDE68A' : index === 1 ? '#E2E8F0' : index === 2 ? '#FDBA74' : '#E2E8F0'}`,
                        }}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                          {student.name}
                        </h3>
                        <div className="text-xs text-slate-500 mt-1 font-medium">
                          {student.chestNo && `Chest: ${student.chestNo} • `}{student.group?.name}
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

        {/* ── Coordinators + Stats ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
          <div>
            <SectionHeading title="About Jeelani Fest" titleAr="عن مهرجان الجيلاني" centered={true} />
            <GlassCard className="p-8 bg-white border border-slate-200 shadow-sm" hover={false}>
              <p className="leading-relaxed mb-6 text-slate-600 text-base">
                Jeelani Fest 2026 is the ultimate celebration of art, culture, and competitive spirit. Bringing together the brightest minds and most talented individuals, it serves as a prestigious platform for students to unleash their passion across hundreds of diverse programs.
              </p>
              <p className="leading-relaxed text-slate-600 text-base">
                Rooted in tradition but looking towards the future, our festival is a testament to the power of creativity and the unifying force of artistic expression.
              </p>
            </GlassCard>
          </div>

          <div>
            <SectionHeading title="Meet the Coordinators" titleAr="فريق التنسيق" centered={true} />
            <div className="space-y-4">
              {dummyCoordinators.map((coord, i) => (
                <motion.div key={i} whileHover={{ x: 6 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                  <GlassCard className="flex items-center gap-5 p-4 bg-white border border-slate-200 shadow-sm">
                    <img
                      src={coord.photo}
                      alt={coord.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                    />
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{coord.name}</h4>
                      <p className="text-xs uppercase tracking-[0.15em] font-bold text-sky-600 mt-0.5">{coord.role}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
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
    </div>
  );
};

export default Home;

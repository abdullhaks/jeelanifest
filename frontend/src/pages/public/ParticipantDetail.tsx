import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import apiClient from '../../services/apiClient';
import { LatticeBackground, GlassCard } from '../../components/publiccomponents/DesignSystem';

const ParticipantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await apiClient.get(`/public/students/${id}`);
        setStudent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ink-navy)' }}>
      <Spin size="large" />
    </div>
  );

  if (!student) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ink-navy)', color: 'rgba(243, 236, 221, 0.4)' }}>
      Participant not found.
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 relative" style={{ background: 'var(--ink-navy)' }}>
      <LatticeBackground opacity={0.04} parallax={false} />

      <div className="w-full mx-auto px-6 max-w-4xl relative z-10">
        <button
          onClick={() => navigate('/participants')}
          className="flex items-center gap-2 font-medium mb-12 transition-colors"
          style={{ color: 'rgba(243, 236, 221, 0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--brass-gold)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(243, 236, 221, 0.5)')}
        >
          <ArrowLeftOutlined /> Back to Participants
        </button>

        <GlassCard className="p-10 flex flex-col md:flex-row items-center gap-10" hover={false}>
          <div
            className="w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center font-bold text-6xl"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, var(--emerald-deep), var(--emerald-muted))',
              color: 'var(--brass-gold)',
              border: '3px solid var(--glass-border)',
              boxShadow: 'var(--shadow-glow-brass)',
            }}
          >
            {student.name.charAt(0)}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory-parchment)' }}
            >
              {student.name}
            </h1>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
              <span
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                style={{ background: 'rgba(201,160,99,0.1)', border: '1px solid rgba(201,160,99,0.2)', color: 'var(--brass-gold)' }}
              >
                Chest: {student.chestNo || 'N/A'}
              </span>
              <span
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                style={{ background: 'rgba(110,36,48,0.15)', border: '1px solid rgba(110,36,48,0.2)', color: '#E8A0AC' }}
              >
                {student.category}
              </span>
              <span
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                style={{ background: 'rgba(26,122,94,0.15)', border: '1px solid rgba(26,122,94,0.25)', color: 'var(--emerald-light)' }}
              >
                {student.group?.name || 'No Group'}
              </span>
            </div>

            <div
              className="inline-block rounded-2xl p-6 px-12 text-center"
              style={{
                background: 'linear-gradient(135deg, var(--emerald-deep), var(--emerald-muted))',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-glow-brass)',
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(243, 236, 221, 0.45)' }}>
                Total Points
              </div>
              <div className="font-mono text-5xl md:text-6xl font-bold" style={{ color: 'var(--brass-gold)' }}>
                {student.points}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ParticipantDetail;

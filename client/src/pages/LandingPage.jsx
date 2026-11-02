import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--gray-100)',
        padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="flex items-center gap-2">
          <div style={{
            width: 36, height: 36, background: 'var(--primary)', borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>🏥</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>QueueCare</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/appointments/book')}>Book Appointment</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #0C4A6E 60%, #0E7490 100%)',
        color: '#fff', padding: '100px 48px 120px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(14,165,233,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(13,148,136,0.15) 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,0.15)',
            border: '1px solid rgba(14,165,233,0.3)', borderRadius: 20, padding: '5px 14px',
            fontSize: 12, fontWeight: 600, color: '#7DD3FC', marginBottom: 24, letterSpacing: '0.05em'
          }}>
            ✦ ONLINE APPOINTMENT SYSTEM
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: -1 }}>
            Skip the<br />
            <span style={{ color: '#38BDF8' }}>Waiting Room</span>
          </h1>
          <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
            Book your appointment online and track your queue position in real time. No more crowded waiting rooms.
          </p>
          <div className="flex justify-center gap-3" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              📅 Book Appointment
            </button>
            <button
              className="btn btn-lg"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)' }}
              onClick={() => navigate('/queue/track')}
            >
              🔢 Track Queue
            </button>
          </div>
        </div>
        {/* Floating stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 64, flexWrap: 'wrap' }}>
          {[
            { num: '500+', label: 'Patients Served' },
            { num: '5', label: 'Medical Services' },
            { num: '< 5min', label: 'Avg Wait Saved' },
            { num: '99%', label: 'Satisfaction Rate' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#38BDF8' }}>{s.num}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: '80px 48px', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>Our Services</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 16 }}>Comprehensive healthcare services available for online booking</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
            {[
              { icon: '🩺', name: 'General Consultation', color: '#3B82F6', bg: '#EFF6FF' },
              { icon: '🦷', name: 'Dental Consultation', color: '#06B6D4', bg: '#ECFEFF' },
              { icon: '❤️', name: 'Health Checkup', color: '#10B981', bg: '#ECFDF5' },
              { icon: '🏃', name: 'Physiotherapy', color: '#8B5CF6', bg: '#F5F3FF' },
              { icon: '💉', name: 'Vaccination', color: '#F59E0B', bg: '#FFFBEB' },
            ].map(s => (
              <div key={s.name} className="card" style={{ padding: 24, textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: 56, height: 56, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px' }}>
                  {s.icon}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)' }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>How It Works</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 16 }}>Simple 3 steps to skip the queue</p>
          </div>
          <div className="three-col">
            {[
              { step: '01', icon: '🔐', title: 'Login to Portal', desc: 'Sign in with your credentials to access the patient portal and manage your appointments.' },
              { step: '02', icon: '📅', title: 'Book Appointment', desc: 'Choose your service, pick a convenient date and time slot, and confirm your booking instantly.' },
              { step: '03', icon: '📡', title: 'Track in Real Time', desc: 'Receive your queue number and track your position live. Get notified when your turn approaches.' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: 16 }}>STEP {item.step}</div>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{item.title}</h3>
                <p style={{ color: 'var(--gray-500)', lineHeight: 1.7, fontSize: 14 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>Why QueueCare?</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 16 }}>Built for modern healthcare management</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
            {[
              { icon: '⚡', title: 'Real-Time Updates', desc: 'Queue position and estimated wait times update automatically.' },
              { icon: '📱', title: 'Mobile Friendly', desc: 'Access from any device — desktop, tablet or mobile.' },
              { icon: '🔔', title: 'Smart Notifications', desc: 'Get notified when your turn is approaching.' },
              { icon: '🗓️', title: 'Easy Rescheduling', desc: 'Cancel or reschedule appointments with a few clicks.' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Admin gets comprehensive insights on daily operations.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Role-based access ensures data security.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h4 style={{ fontWeight: 600, marginBottom: 6 }}>{f.title}</h4>
                <p style={{ color: 'var(--gray-500)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 48px', textAlign: 'center',
        background: 'linear-gradient(135deg, var(--primary-dark), var(--teal))',
        color: '#fff'
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Ready to Get Started?</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 36 }}>
          Join thousands of patients who have already simplified their healthcare journey
        </p>
        <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary-dark)', fontWeight: 700 }}
          onClick={() => navigate('/login')}>
          Get Started — It's Free
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--gray-900)', color: 'var(--gray-400)', padding: '40px 48px', textAlign: 'center' }}>
        <div className="flex items-center justify-center gap-2" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>🏥</span>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>QueueCare</span>
        </div>
        <p style={{ fontSize: 13 }}>Online Appointment & Queue Management System</p>
        <p style={{ fontSize: 12, marginTop: 8, color: 'var(--gray-600)' }}>
          MCA Final Year Project · Built with React & Node.js
        </p>
      </footer>
    </div>
  )
}

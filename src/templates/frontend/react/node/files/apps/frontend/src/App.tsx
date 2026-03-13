import { useState, useEffect } from 'react'

function App() {
  const [apiMessage, setApiMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:4000/')
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message || 'Connected to backend!'))
      .catch((err) => setApiMessage('Failed to connect to backend on port 4000'))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif', color: '#fff', padding: '2rem' }}>
      <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '3rem', borderRadius: '24px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', width: '100%', maxWidth: '800px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', background: 'linear-gradient(to right, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {{projectName}}
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#a0aec0', marginBottom: '2.5rem' }}>Ignited by Forge-Gen</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: apiMessage.includes('Failed') ? '#ef4444' : '#10b981', boxShadow: `0 0 10px ${apiMessage.includes('Failed') ? '#ef4444' : '#10b981'}` }}></span>
              Core API Status
            </h2>
            <div style={{ fontSize: '0.95rem', color: apiMessage.includes('Failed') ? '#fca5a5' : '#a7f3d0' }}>
              {apiMessage}
            </div>
          </div>
          
          {/* forge:dynamic_frontend_integration */}

        </div>
      </div>
    </div>
  )
}

export default App

<script>
  import { onMount } from 'svelte';
  
  let apiMessage = 'Loading...';
  
  onMount(async () => {
    try {
      const res = await fetch('http://localhost:4000/');
      const data = await res.json();
      apiMessage = data.message || 'Connected to backend!';
    } catch (err) {
      apiMessage = 'Failed to connect to backend on port 4000';
    }
  });
</script>

<div class="forge-container">
  <div class="forge-card">
    <h1 class="forge-title">{{projectName}}</h1>
    <p class="forge-subtitle">Ignited by Forge-Gen</p>
    
    <div class="forge-grid">
      <div class="forge-status-box">
        <h2 class="forge-status-title">
          <span class="forge-status-dot" class:error={apiMessage.includes('Failed')} class:success={!apiMessage.includes('Failed') && !apiMessage.includes('Loading')}></span>
          Core API Status
        </h2>
        <div class="forge-status-msg" class:text-error={apiMessage.includes('Failed')} class:text-success={!apiMessage.includes('Failed') && !apiMessage.includes('Loading')}>
          {apiMessage}
        </div>
      </div>
      
      <!-- forge:dynamic_frontend_integration -->

    </div>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

  :global(body) {
    margin: 0;
    padding: 0;
  }

  .forge-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    color: #fff;
    padding: 2rem;
    box-sizing: border-box;
  }

  .forge-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 3rem;
    border-radius: 24px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 800px;
    text-align: center;
  }

  .forge-title {
    font-size: 3rem;
    margin: 0 0 1rem 0;
    background: linear-gradient(to right, #00f2fe, #4facfe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .forge-subtitle {
    font-size: 1.2rem;
    color: #a0aec0;
    margin-bottom: 2.5rem;
  }

  .forge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    text-align: left;
  }

  .forge-status-box {
    background: rgba(0, 0, 0, 0.2);
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .forge-status-title {
    font-size: 1.1rem;
    color: #cbd5e1;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .forge-status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #94a3b8;
    box-shadow: 0 0 10px #94a3b8;
  }

  .forge-status-dot.success {
    background: #10b981;
    box-shadow: 0 0 10px #10b981;
  }

  .forge-status-dot.error {
    background: #ef4444;
    box-shadow: 0 0 10px #ef4444;
  }

  .forge-status-msg {
    font-size: 0.95rem;
    color: #94a3b8;
  }

  .text-success { color: #a7f3d0; }
  .text-error { color: #fca5a5; }
</style>
'use client';
import { ArcAppKitProvider, ArcBridge, ArcSwap } from '@arc-finance/app-kit';
import { useState } from 'react';

export default function Home() {
  const [taskId, setTaskId] = useState('');
  const [status, setStatus] = useState('');

  const handleFulfill = async () => {
    setStatus('Appel de l\'IA en cours sur Vercel...');
    const res = await fetch('/api/fulfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: parseInt(taskId) })
    });
    const data = await res.json();
    if (data.success) setStatus(`✅ Succès ! Tx: ${data.txHash}`);
    else setStatus(`❌ Erreur: ${data.error}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>ArcPay AI Agent</h1>
      <p>Paiements USDC pour agents IA sur Arc Network.</p>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Outils Arc App Kit */}
        <div style={{ flex: 1, border: '1px solid #333', padding: '1rem', borderRadius: '8px' }}>
          <h2>1. Gestion USDC (Arc Kit)</h2>
          <ArcBridge />
          <hr style={{ margin: '1rem 0' }} />
          <ArcSwap />
        </div>

        {/* Ton App IA */}
        <div style={{ flex: 1, border: '1px solid #333', padding: '1rem', borderRadius: '8px' }}>
          <h2>2. Exécuter l'Agent IA</h2>
          <p style={{ fontSize: '0.8rem', color: 'gray' }}>Entre l'ID de la tâche créée sur le contrat.</p>
          <input 
            type="number" 
            value={taskId} 
            onChange={(e) => setTaskId(e.target.value)} 
            placeholder="Ex: 0"
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
          <button onClick={handleFulfill} style={{ width: '100%', padding: '0.5rem', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}>
            Lancer l'IA & Libérer les USDC
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>{status}</p>
        </div>

      </div>
    </div>
  );
}

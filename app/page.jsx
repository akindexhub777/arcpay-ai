'use client';
import { useState, useEffect } from 'react';

// Mets ici l'adresse de ton contrat déployé sur Arc Testnet
const CONTRACT_ADDRESS = "0xc28811fCbbF8f05394dCdA386b8F9d2ddf9fE66a"; 

const ABI = [
  "function createTask(string _prompt, uint256 _price) external",
  "function fulfillTask(uint256 _taskId, string _result) external"
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Ceci est MAGIQUE : il dit à Vercel de ne pas lire ce code pendant le build
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCreateTask = async () => {
    if (!window.ethereum) return alert("Installe MetaMask !");
    setStatus("Connexion à MetaMask...");
    
    // On utilise window.ethers car on l'a chargé dans le layout.js
    const provider = new window.ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new window.ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    try {
      const price = window.ethers.parseUnits("1", 6); // 1 USDC
      const tx = await contract.createTask(prompt, price);
      setStatus("Transaction de paiement en cours...");
      await tx.wait();
      setTaskId(0); 
      setStatus("✅ Payé ! Maintenant, clique pour lancer l'IA.");
    } catch (error) {
      setStatus("❌ Erreur: " + (error.reason || error.message));
    }
  };

  const handleFulfill = async () => {
    setStatus("Appel à l'IA gratuite (Groq)...");
    
    const res = await fetch('/api/fulfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();

    if (!data.result) return setStatus("❌ Erreur IA");

    setStatus("IA a répondu ! Envoi on-chain via MetaMask...");
    const provider = new window.ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new window.ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    try {
      const tx = await contract.fulfillTask(taskId, data.result);
      await tx.wait();
      setStatus(`✅ Succès total ! Tx: ${tx.hash}`);
    } catch (error) {
      setStatus("❌ Erreur On-Chain: " + (error.reason || error.message));
    }
  };

  // Si Vercel est en train de compiler, on affiche juste "Chargement..."
  if (!isMounted) {
    return <div style={{ padding: '2rem' }}>Chargement de l'App...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>ArcPay AI (100% Sécurisé)</h1>
      
      <textarea 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Entrez votre prompt pour l'IA..."
        style={{ width: '100%', height: '100px', padding: '10px', margin: '10px 0', background: '#1a1a1a', color: 'white', border: '1px solid #333' }}
      />

      {!taskId ? (
        <button onClick={handleCreateTask} style={{ width: '100%', padding: '15px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '8px' }}>
          1. Payer 1 USDC et Créer la tâche
        </button>
      ) : (
        <button onClick={handleFulfill} style={{ width: '100%', padding: '15px', background: 'green', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '8px' }}>
          2. Lancer l'IA et Enregistrer on-chain
        </button>
      )}

      <p style={{ marginTop: '20px', color: '#aaa' }}>{status}</p>
    </div>
  );
}

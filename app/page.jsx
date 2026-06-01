'use client';
import { useState } from 'react';

// Mets ici l'adresse de ton NOUVEAU contrat déployé à l'étape 1
const CONTRACT_ADDRESS = "0xc28811fCbbF8f05394dCdA386b8F9d2ddf9fE66a";

// L'ABI minimale pour interagir
const ABI = [
  "function createTask(string _prompt, uint256 _price) external",
  "function fulfillTask(uint256 _taskId, string _result) external"
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState('');

  // 1. Créer la tâche (Paiement USDC)
  const handleCreateTask = async () => {
    if (!window.ethereum) return alert("Installe MetaMask !");
    setStatus("Connexion à MetaMask...");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    try {
      // Prix en USDC (6 décimales) : 1 USDC = 1000000
      const price = ethers.parseUnits("1", 6); 
      const tx = await contract.createTask(prompt, price);
      setStatus("Transaction de paiement en cours...");
      await tx.wait();
      
      // On simule que c'est la tâche 0 (pour le test)
      setTaskId(0); 
      setStatus("✅ Payé ! Maintenant, génère la réponse IA.");
    } catch (error) {
      setStatus("❌ Erreur: " + error.reason);
    }
  };

  // 2. Appeler l'IA puis remplir la tâche on-chain
  const handleFulfill = async () => {
    setStatus("Appel à l'IA sur Vercel (sans clé privée)...");
    
    // Appel de ton API Vercel
    const res = await fetch('/api/fulfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();

    if (!data.result) return setStatus("❌ Erreur IA");

    setStatus("IA a répondu ! Envoi on-chain via MetaMask...");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    try {
      // C'est le METAASK DE L'UTILISATEUR qui signe la transaction
      const tx = await contract.fulfillTask(taskId, data.result);
      await tx.wait();
      setStatus(`✅ Succès total ! Tx: ${tx.hash}`);
    } catch (error) {
      setStatus("❌ Erreur On-Chain: " + error.reason);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>ArcPay AI (100% Sécurisé)</h1>
      
      <textarea 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Entrez votre prompt pour l'IA..."
        style={{ width: '100%', height: '100px', padding: '10px', margin: '10px 0' }}
      />

      {!taskId ? (
        <button onClick={handleCreateTask} style={{ width: '100%', padding: '15px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          1. Payer 1 USDC et Créer la tâche
        </button>
      ) : (
        <button onClick={handleFulfill} style={{ width: '100%', padding: '15px', background: 'green', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          2. Lancer l'IA et Enregistrer on-chain
        </button>
      )}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.9.0/ethers.umd.min.js"></script>
      <p style={{ marginTop: '20px', color: '#aaa' }}>{status}</p>
    </div>
  );
}

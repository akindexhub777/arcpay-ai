// Mets ici ta NOUVELLE adresse de contrat IA déployée à l'étape 2
const CONTRACT_ADDRESS = "0x18E8BD68bb9B0B246eDC91B5e957fbc9b8Ec9859"; 

// Mets ici l'adresse du VRAI USDC trouvée sur ArcScan à l'étape 1
const USDC_ADDRESS = "0x_ADRESSE_DU_VRAI_USDC";

const ABI = [
  "function createTask(string _prompt, uint256 _price) external",
  "function fulfillTask(uint256 _taskId, string _result) external"
];

// ... (garde le reste du code au-dessus comme le useState, useEffect, handleFulfill...)

  const handleCreateTask = async () => {
    if (!window.ethereum) return alert("Installe MetaMask !");
    setStatus("Connexion à MetaMask...");
    
    const provider = new window.ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // On prépare le contrat USDC pour donner la permission
    const usdcAbi = ["function approve(address spender, uint256 amount) returns (bool)"];
    const usdcContract = new window.ethers.Contract(USDC_ADDRESS, usdcAbi, signer);
    
    // On prépare ton contrat IA
    const contract = new window.ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    try {
      const price = window.ethers.parseUnits("1", 6); // 1 USDC
      
      // NOUVEAU : Étape 1 - On donne l'autorisation au contrat de prendre 1 USDC
      setStatus("Étape 1 sur 2 : Autorisation (Approve) en cours... Signe sur MetaMask !");
      const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, price);
      await approveTx.wait();

      // Étape 2 - On paie
      setStatus("Étape 2 sur 2 : Paiement de 1 USDC... Signe sur MetaMask !");
      const tx = await contract.createTask(prompt, price);
      await tx.wait();
      
      setTaskId(0); 
      setStatus("✅ Payé ! Maintenant, clique sur le bouton vert pour lancer l'IA.");
    } catch (error) {
      setStatus("❌ Erreur: " + (error.reason || error.message));
    }
  };

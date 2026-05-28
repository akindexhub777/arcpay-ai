import { ethers } from 'ethers';
import OpenAI from 'openai';

export default async function handler(req, res) {
  // Sécurité : uniquement en POST
  if (req.method !== 'POST') return res.status(405).end();

  const { taskId } = req.body;

  try {
    // 1. Connexion à Arc via le RPC public
    const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');
    
    // 2. Le wallet du serveur (Vercel va lire la clé dans ses variables d'environnement)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // 3. Le contrat
    const abi = [
      "function tasks(uint256) view returns (address user, string prompt, string result, bool isCompleted, uint256 price)",
      "function fulfillTask(uint256 _taskId, string _result) external"
    ];
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

    // 4. Récupérer le prompt on-chain
    const task = await contract.tasks(taskId);
    if (task.isCompleted) return res.status(400).json({ error: 'Déjà complété' });

    // 5. Appeler l'IA (OpenAI)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: task.prompt }],
    });

    // 6. Envoyer la réponse on-chain (ce qui déclenche le paiement USDC)
    const tx = await contract.fulfillTask(taskId, completion.choices[0].message.content);
    await tx.wait();

    res.status(200).json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

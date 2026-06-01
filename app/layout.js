export const metadata = {
  title: 'ArcPay AI',
  description: 'AI Agent on Arc Network',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* On charge Ethers depuis le web pour éviter de l'installer sur Vercel */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.9.0/ethers.umd.min.js"></script>
      </head>
      <body style={{ backgroundColor: '#0a0a0a', color: 'white', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}

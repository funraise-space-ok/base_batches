# Base Batches - Sports Trading Cards on Base

A blockchain-based sports trading card game built on Base, featuring pack opening mechanics, player collections, and team staking functionality.

## 🎮 About

Base Batches is a decentralized application (dApp) where users can:
- **Buy Pack Cards** - Purchase Bronze, Silver, and Gold packs containing random player cards
- **Build Teams** - Collect and organize your team of 5 players per pack
- **Stake & Earn** - Put your teams "on field" to participate in the staking mechanism
- **Trade & Collect** - Own unique digital sports cards as NFTs on the Base blockchain

Built with modern web3 technologies and integrated with the Base ecosystem, including Sign in with Base and Base Pay.

## ✨ Features

- 🎨 Beautiful pack opening animations with rarity-based card reveals
- 🔗 Seamless wallet integration via WalletConnect and Base SDK
- ⚡ Fast and low-cost transactions on Base network
- 📱 Fully responsive design for mobile and desktop
- 🎵 Immersive audio effects for pack openings and team actions
- 🏟️ Interactive dashboard to manage your teams and staking status

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Material-UI (MUI), Framer Motion
- **Web3**: wagmi, viem, Base SDK
- **Smart Contracts**: Solidity, Hardhat
- **Blockchain**: Base (Ethereum L2)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)
- ETH on Base network for transactions

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd base_batches
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with your configuration (see `.env.example` for reference)

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

## 📁 Project Structure

```
base_batches/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Utility functions and Web3 hooks
├── contracts/        # Smart contract source code
├── public/           # Static assets (images, audio)
└── hardhat/          # Smart contract development environment
```

## 🎯 How to Play

1. **Connect Wallet** - Connect your Base-compatible wallet
2. **Buy Packs** - Choose from Bronze, Silver, or Gold packs
3. **Open Packs** - Experience the thrill of revealing your player cards
4. **Build Teams** - Organize your 5-player teams
5. **Stake Teams** - Put teams "on field" to participate in staking
6. **Withdraw** - Collect your staked teams after the timelock period

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Base Network](https://base.org)
- [Base Docs](https://docs.base.org)

---

Built with ⚡ on Base

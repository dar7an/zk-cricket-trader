# ZK Cricket Trader

A decentralized betting platform built on the Mina Protocol that allows users to place bets on cricket fixtures in a trustless and transparent manner. The smart contract leverages oracle-verified fixture data and uses a Merkle tree to efficiently store user bets off-chain.

## 🏗️ Architecture

- **zkApp Contract**: Verifies oracle signatures and manages bet state using Merkle trees
- **Oracle Integration**: Retrieves verified fixture data from [sportmonksoracle](https://github.com/dar7an/sportmonksoracle)
- **Cryptographic Verification**: All fixture data is cryptographically signed by the oracle before being accepted on-chain

## 🚀 Features

- **Trustless Betting**: Users can place bets on cricket matches with cryptographic proof of fixture integrity
- **Oracle Verification**: Fixture data and match status are verified through cryptographic signatures
- **Efficient Storage**: Uses Merkle trees to store unlimited bets off-chain while maintaining on-chain verification
- **End-to-End Testing**: Comprehensive test suite covering all functionality

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- o1js library

## 🛠️ Installation

```bash
git clone https://github.com/dar7an/zk-cricket-trader
cd zk-cricket-trader
npm install
```

## 🧪 Testing

Run the complete test suite:

```bash
npm test
```

The test suite includes:
- ✅ Contract deployment and initialization
- ✅ Oracle signature verification (hardcoded data)
- ✅ Live oracle integration (fixture endpoint)
- ✅ Live oracle integration (status endpoint)
- ✅ Bet placement and Merkle tree updates

## 🔗 Oracle Integration

This zkApp integrates with the [SportMonks Oracle](https://github.com/dar7an/sportmonksoracle) which provides:

### Fixture Endpoint
`GET https://sportmonksoracle.vercel.app/fixture`

Returns the next upcoming cricket fixture with cryptographic signature:

```json
{
  "data": {
    "fixtureID": 66230,
    "localTeamID": 39,
    "visitorTeamID": 37,
    "startingAt": 1752154200000,
    "localteam_name": "Sri Lanka",
    "localteam_code": "SL",
    "visitorteam_name": "Bangladesh",
    "visitorteam_code": "BGD",
    "timestamp": 1750443291387
  },
  "signature": "7mXMSfa76SyThnDoASzsBSr1kPLZdYTRwdpn4y3eQS428aX5Aw5WAuuSkbo7zeAoWP2WMVC1xfBa557NQchW5e3P8sgAQX55",
  "publicKey": "B62qp7eyQ9RKwdYBLWNzxmfKntP6dPDrTSQ1ukyYsV4FoTkJH6sfuPU"
}
```

### Status Endpoint
`GET https://sportmonksoracle.vercel.app/status/{fixtureID}`

Returns the current status of a specific fixture:

```json
{
  "data": {
    "fixtureID": 66230,
    "localTeamID": 39,
    "visitorTeamID": 37,
    "startingAt": 1752154200000,
    "status": 1,
    "winnerTeamID": 0,
    "timestamp": 1750443564321
  },
  "signature": "7mXXWXhc35tXAVJdq6Lr2FuW6nkJqGGiZQ2wVWnY7PjTHX8qE57798QB4N96qtZPWWh5jCDt5aeEaM1zf9rgDANap1Jy5nPU",
  "publicKey": "B62qp7eyQ9RKwdYBLWNzxmfKntP6dPDrTSQ1ukyYsV4FoTkJH6sfuPU"
}
```

## 🔐 Signature Scheme

The oracle signs specific field arrays using Schnorr signatures on the Pallas curve:

**Fixture Signature**: `[fixtureID, localTeamID, visitorTeamID, startingAt]`
**Status Signature**: `[fixtureID, localTeamID, visitorTeamID, startingAt, status, winnerTeamID]`

The zkApp verifies these signatures on-chain before accepting any fixture data.

## 📁 Project Structure

```
zk-cricket-trader/
├── frontend/
│   ├── index.html       # Web interface for cricket betting
│   ├── vercel.json      # Frontend deployment configuration
│   └── .vercelignore    # Frontend deployment exclusions
├── src/
│   ├── Bet.ts           # Main zkApp smart contract
│   ├── BetStorage.ts    # Off-chain Merkle tree management
│   ├── structs.ts       # Data structures and types
│   ├── oracleUtils.ts   # Oracle signature utilities
│   └── Bet.test.ts      # Comprehensive test suite
├── package.json         # Contract dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## 🎯 Usage

### Deploy the Contract

```typescript
import { Bet } from './src/Bet.js';

// Deploy and initialize
const zkApp = new Bet(zkAppAddress);
await zkApp.deploy();
```

### Update Fixture Data

```typescript
// Fetch from oracle
const response = await fetch('https://sportmonksoracle.vercel.app/fixture');
const data = await response.json();

// Update on-chain
await zkApp.updateFixture(
  Field(data.data.fixtureID),
  Field(data.data.localTeamID),
  Field(data.data.visitorTeamID),
  Field(data.data.startingAt),
  Signature.fromBase58(data.signature)
);
```

### Place a Bet

```typescript
import { BetInfo, BetStorage } from './src/index.js';

const betInfo = new BetInfo({
  userPublicKey: userPublicKey,
  teamID: Field(39), // Sri Lanka
  amount: Field(100)
});

const betStorage = new BetStorage();
const witness = betStorage.getWitness(betStorage.nextIndex);

await zkApp.placeBet(betInfo, witness);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [SportMonks Oracle](https://github.com/dar7an/sportmonksoracle) - Provides verified cricket fixture data
- [Mina Protocol](https://minaprotocol.com) - The zero-knowledge blockchain platform
- [o1js](https://github.com/o1-labs/o1js) - TypeScript framework for zkApps

## 🌐 Frontend Demo

**Live Demo**: [Cricket Trader on Vercel](https://zk-cricket-trader.vercel.app)

The frontend provides a user-friendly interface where anyone can:
- View live cricket matches from the oracle
- Place bets on their favorite teams
- Experience the app without technical knowledge

### Local Frontend Development
```bash
# Serve the frontend locally
cd frontend
python -m http.server 8000
# Visit http://localhost:8000
```

---

Built with ❤️ on Mina Protocol

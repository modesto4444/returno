# Returno

### A Blockchain-Based Lost and Found System Using Solidity Smart Contracts with Automated Item Matching and Immutable Records

Returno is a web-based lost and found application that uses Ethereum smart contracts written in Solidity to store item reports as immutable, tamper-evident records. An automated matching algorithm compares lost and found reports based on category, location, date, and description to identify potential matches.

---

## Project Structure

```
returno/
├── icons/                      # Item category icons
├── images/                     # Background images
├── hardhat-contracts/          # Ethereum smart contract project
│   ├── contracts/
│   │   └── Returno.sol         # Solidity smart contract
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   ├── hardhat.config.ts       # Hardhat configuration
│   └── package.json
├── returno-backend/            # Node.js backend server (CREATE THIS)
│   ├── server.js               # Express API server
│   ├── blockchain.js           # Blockchain utility
│   ├── matcher.js              # Item matching algorithm
│   └── package.json
├── index.html                  # Homepage
├── view-items.html             # Browse all reports
├── item-details.html           # Single item detail page
├── report-lost.html            # Report lost item form
├── report-found.html           # Report found item form
├── script.js                   # Frontend JavaScript
└── styles.css                  # Stylesheet
```

---

## Prerequisites

Make sure you have the following installed before running the project:

- Node.js v18 or higher — https://nodejs.org
- npm (comes with Node.js)
- A terminal or command prompt

---

## Setup Instructions

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/returno.git
cd returno
```

---

### Step 2 — Create the returno-backend Folder

This folder is not included in the repository because it contains generated files. You must create it manually.

```bash
mkdir returno-backend
cd returno-backend
```

Inside returno-backend, create the following files:

**package.json** — paste this content:

```json
{
  "name": "returno-backend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "cors": "^2.8.5",
    "ethers": "^6.0.0",
    "express": "^4.18.2"
  }
}
```

Then install dependencies:

```bash
npm install
```

You will also need to create the following files inside returno-backend:

- server.js — the main Express API server
- matcher.js — the automated item matching algorithm
- blockchain.js — blockchain utility file

These files contain the core backend logic and should be obtained from the project author or repository releases.

---

### Step 3 — Set Up the Hardhat Smart Contract Project

```bash
cd ../hardhat-contracts
npm install
```

---

### Step 4 — Compile the Smart Contract

```bash
npx hardhat compile
```

You should see:

```
Compiled 1 Solidity file with solc 0.8.19
```

---

## Running the Project

You need three terminals open at the same time.

---

### Terminal 1 — Start the Local Blockchain Node

```bash
cd returno/hardhat-contracts
npx hardhat node
```

Keep this running. You will see a list of test accounts with fake ETH — this is your local Ethereum network.

---

### Terminal 2 — Deploy the Smart Contract

```bash
cd returno/hardhat-contracts
node scripts/deploy.js
```

You should see:

```
Deploying Returno...
Deploying from: 0xf39Fd6e51...
Returno deployed to: 0x5FbDB231...
Address saved to contract-config.json automatically
```

Note: This must be done every time you restart the hardhat node, as the local blockchain resets on restart.

---

### Terminal 3 — Start the Backend Server

```bash
cd returno/returno-backend
node server.js
```

You should see:

```
Using contract: 0x5FbDB231...
Returno running on http://localhost:3000
```

---

### Open the Application

Open your browser and go to:

```
http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | Retrieve all recorded reports |
| GET | /api/items/:id | Retrieve a single item by ID |
| POST | /api/report | Submit a new lost or found report |
| GET | /api/verify | Check blockchain validity and total reports |

---

## Testing the System

1. Go to http://localhost:3000
2. Click Report Lost Item and fill out the form
3. Click Report Found Item and submit a similar item
4. Go to View Reported Items to see both records with their BF-XXX blockchain IDs
5. Click on a matched item to see the Potential Match Found panel
6. Visit http://localhost:3000/api/verify to confirm chain validity
7. Visit http://localhost:3000/api/items to see raw blockchain data

---

## Important Notes

- The hardhat node must be running before you start the server
- The smart contract must be redeployed every time you restart the hardhat node
- All data is stored on the local Ethereum node — closing the hardhat node clears all submitted reports
- The contract-config.json file is auto-generated by deploy.js and read automatically by server.js — no manual address updates needed

---

## Future Development

- Deploy to Ethereum Sepolia testnet for persistent, publicly verifiable records
- Implement backend processing for the contact request feature
- Improve description matching with natural language processing
- Add user authentication and account management

---

## Built With

- Frontend — HTML, CSS, Vanilla JavaScript
- Backend — Node.js, Express
- Blockchain — Solidity 0.8.19, Hardhat, ethers.js
- Network — Local Hardhat Ethereum node

---

## License

This project was developed as an academic thesis project.

// Faucet Contract ABI
// Copy your actual ABI here from your contract compilation
export const FAUCET_ABI = [
    {
      "inputs": [
        {
          "internalType": "contract VortanToken",
          "name": "_vortToken",
          "type": "address"
        },
        {
          "internalType": "contract SOMI",
          "name": "_somiToken",
          "type": "address"
        },
        {
          "internalType": "contract USDC",
          "name": "_usdcToken",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "vortAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "somiAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "usdcAmount",
          "type": "uint256"
        }
      ],
      "name": "TokensClaimed",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "claimTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fundFaucet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasClaimed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "somiToken",
      "outputs": [
        {
          "internalType": "contract SOMI",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "usdcToken",
      "outputs": [
        {
          "internalType": "contract USDC",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "vortToken",
      "outputs": [
        {
          "internalType": "contract VortanToken",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;

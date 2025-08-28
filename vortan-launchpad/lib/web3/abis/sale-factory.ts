// SaleFactory Contract ABI
// Copy your actual ABI here from your contract compilation
export const SALE_FACTORY_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_platformTreasury",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldTreasury",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newTreasury",
          "type": "address"
        }
      ],
      "name": "PlatformTreasuryUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "sale",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "saleToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "projectOwner",
          "type": "address"
        }
      ],
      "name": "SaleCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "addFeeRecipient",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allSales",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
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
      "name": "approvedFeeRecipients",
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
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "saleToken",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "baseToken",
              "type": "address"
            },
            {
              "internalType": "uint96",
              "name": "priceNum",
              "type": "uint96"
            },
            {
              "internalType": "uint96",
              "name": "priceDen",
              "type": "uint96"
            },
            {
              "internalType": "uint64",
              "name": "start",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "end",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "tgeTime",
              "type": "uint64"
            },
            {
              "internalType": "uint16",
              "name": "tgeBps",
              "type": "uint16"
            },
            {
              "internalType": "uint64",
              "name": "vestStart",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "vestDuration",
              "type": "uint64"
            },
            {
              "internalType": "uint96",
              "name": "hardCapBase",
              "type": "uint96"
            },
            {
              "internalType": "uint96",
              "name": "softCapBase",
              "type": "uint96"
            },
            {
              "internalType": "uint96",
              "name": "perWalletCapBase",
              "type": "uint96"
            },
            {
              "internalType": "uint96",
              "name": "tier1CapBase",
              "type": "uint96"
            },
            {
              "internalType": "uint96",
              "name": "tier2CapBase",
              "type": "uint96"
            },
            {
              "internalType": "uint96",
              "name": "tier3CapBase",
              "type": "uint96"
            },
            {
              "internalType": "address",
              "name": "tierOracle",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "projectOwner",
              "type": "address"
            }
          ],
          "internalType": "struct SaleFactory.SaleParams",
          "name": "p",
          "type": "tuple"
        }
      ],
      "name": "createSale",
      "outputs": [
        {
          "internalType": "address",
          "name": "sale",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllSales",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "platformFeeBps",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "platformTreasury",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "removeFeeRecipient",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "salesCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint16",
          "name": "_feeBps",
          "type": "uint16"
        }
      ],
      "name": "setPlatformFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_treasury",
          "type": "address"
        }
      ],
      "name": "setPlatformTreasury",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;

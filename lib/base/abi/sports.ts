export const sportsAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Withdraw",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "teamId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "tier",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "valuePaid",
        "type": "uint256"
      }
    ],
    "name": "PackPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "tier",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "PackPriceUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "playerId",
        "type": "uint16"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "teamId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      }
    ],
    "name": "TokenSold",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "teamId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "staked",
        "type": "bool"
      }
    ],
    "name": "TeamStakeUpdated",
    "type": "event"
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
    "name": "nextTeamId",
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
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "name": "packPrices",
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
        "internalType": "uint8",
        "name": "tier",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "termsAccepted",
        "type": "bool"
      }
    ],
    "name": "buyPack",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "teamId",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserTeams",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "teamId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint8",
            "name": "tier",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "staked",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "updatedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct Sports.Team[]",
        "name": "teams",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "teamId",
        "type": "uint256"
      }
    ],
    "name": "getTeam",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "teamId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint8",
            "name": "tier",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "staked",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "updatedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct Sports.Team",
        "name": "",
        "type": "tuple"
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
            "internalType": "uint16",
            "name": "providerId",
            "type": "uint16"
          },
          {
            "internalType": "uint8",
            "name": "category",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "totalTokens",
            "type": "uint32"
          },
          {
            "internalType": "string",
            "name": "metadataUri",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "discipline",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "country",
            "type": "string"
          }
        ],
        "internalType": "struct Sports.PlayerInput[]",
        "name": "inputs",
        "type": "tuple[]"
      }
    ],
    "name": "createPlayersBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "teamId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "staked",
        "type": "bool"
      }
    ],
    "name": "setTeamStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "teamId",
        "type": "uint256"
      }
    ],
    "name": "getTeamDetail",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint8",
            "name": "tier",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "uint64",
            "name": "createdAt",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "transitionTimestamp",
            "type": "uint64"
          },
          {
            "internalType": "bool",
            "name": "termsAccepted",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "pricePaidWei",
            "type": "uint256"
          },
          {
            "internalType": "uint16[]",
            "name": "playerIds",
            "type": "uint16[]"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct Sports.Team",
        "name": "team",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          },
          {
            "internalType": "uint8",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "uint64",
            "name": "transitionTimestamp",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "rewardsEarned",
            "type": "uint256"
          }
        ],
        "internalType": "struct Sports.TeamStakeState",
        "name": "stake",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "tier",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "newPrice",
        "type": "uint256"
      }
    ],
    "name": "updatePackPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
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
  },
  {
    "inputs": [],
    "name": "getPackPrices",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "bronze",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "silver",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "gold",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserTeamIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16[]",
        "name": "ids",
        "type": "uint16[]"
      }
    ],
    "name": "getPlayersByIds",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint16",
            "name": "id",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "providerId",
            "type": "uint16"
          },
          {
            "internalType": "uint8",
            "name": "category",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "totalTokens",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "tokensSold",
            "type": "uint32"
          },
          {
            "internalType": "string",
            "name": "metadataUri",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "discipline",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "country",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct Sports.Player[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

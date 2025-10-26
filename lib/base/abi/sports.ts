export const sportsAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "priceBronzeWei",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "priceSilverWei",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "priceGoldWei",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "baseUri",
        "type": "string"
      },
      {
        "internalType": "uint64",
        "name": "lockSeconds",
        "type": "uint64"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
        "internalType": "uint256",
        "name": "priceBronze",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "priceSilver",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "priceGold",
        "type": "uint256"
      }
    ],
    "name": "PricesUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "reportId",
        "type": "uint256"
      }
    ],
    "name": "ReportClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "added",
        "type": "bool"
      }
    ],
    "name": "StaffUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "teamId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum Sports.TeamState",
        "name": "state",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      }
    ],
    "name": "TeamStakeLifecycle",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "teamId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum Sports.TeamState",
        "name": "newState",
        "type": "uint8"
      }
    ],
    "name": "TeamStateChanged",
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
        "name": "approver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "WithdrawalApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "WithdrawalRequested",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_STAFF",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "addStaff",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "playerId",
        "type": "uint16"
      },
      {
        "internalType": "uint32",
        "name": "tokensToAdd",
        "type": "uint32"
      }
    ],
    "name": "addTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum Sports.PackTier",
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
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "revenue",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "teamsSold",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "tokensSold",
        "type": "uint32"
      },
      {
        "internalType": "uint256",
        "name": "stakerPool",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "stakersCount",
        "type": "uint32"
      }
    ],
    "name": "closeReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "providerId",
        "type": "uint16"
      },
      {
        "internalType": "enum Sports.PlayerCategory",
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
    "name": "createPlayer",
    "outputs": [],
    "stateMutability": "nonpayable",
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
            "internalType": "enum Sports.PlayerCategory",
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
    "inputs": [],
    "name": "currentReportId",
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
    "inputs": [],
    "name": "currentReportRevenue",
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
    "inputs": [],
    "name": "currentReportStart",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentReportTeams",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentReportTokens",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPlayerIds",
    "outputs": [
      {
        "internalType": "uint16[]",
        "name": "",
        "type": "uint16[]"
      }
    ],
    "stateMutability": "view",
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
    "inputs": [],
    "name": "getPendingWithdrawal",
    "outputs": [
      {
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "playerId",
        "type": "uint16"
      }
    ],
    "name": "getPlayer",
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
            "internalType": "enum Sports.PlayerCategory",
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
        "internalType": "struct Sports.Player",
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
            "internalType": "enum Sports.PlayerCategory",
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
        "name": "players",
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
            "internalType": "uint64",
            "name": "createdAt",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "updatedAt",
            "type": "uint64"
          }
        ],
        "internalType": "struct Sports.TeamView",
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
            "internalType": "enum Sports.PackTier",
            "name": "tier",
            "type": "uint8"
          },
          {
            "internalType": "enum Sports.TeamState",
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
            "internalType": "enum Sports.TeamState",
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
            "internalType": "uint64",
            "name": "createdAt",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "updatedAt",
            "type": "uint64"
          }
        ],
        "internalType": "struct Sports.TeamView[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isPaused",
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
    "name": "isReportOpen",
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
    "name": "metadataBaseUri",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextPlayerId",
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
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingWithdrawal",
    "outputs": [
      {
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
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
    "name": "refreshTeamStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "removeStaff",
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
    "name": "reports",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "startTimestamp",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "endTimestamp",
        "type": "uint64"
      },
      {
        "internalType": "uint256",
        "name": "revenue",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "teamsSold",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "tokensSold",
        "type": "uint32"
      },
      {
        "internalType": "uint256",
        "name": "stakerPool",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "stakersCount",
        "type": "uint32"
      },
      {
        "internalType": "uint256",
        "name": "rewardPerStaker",
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
        "name": "playerId",
        "type": "uint16"
      }
    ],
    "name": "resetAvailableTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newUri",
        "type": "string"
      }
    ],
    "name": "setMetadataBaseUri",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "priceBronzeWei",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "priceSilverWei",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "priceGoldWei",
        "type": "uint256"
      }
    ],
    "name": "setPackPrices",
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
        "name": "stake",
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
        "internalType": "uint64",
        "name": "newTimeLockSeconds",
        "type": "uint64"
      }
    ],
    "name": "setTimeLock",
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
    "name": "staff",
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
    "name": "staffCount",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "timeLockSeconds",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "open",
        "type": "bool"
      }
    ],
    "name": "toggleReportOpen",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "playerId",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "providerId",
        "type": "uint16"
      },
      {
        "internalType": "enum Sports.PlayerCategory",
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
    "name": "updatePlayer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
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
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BaseBatches
 * @notice Minimal contract to mirror the pack purchase and staking flow on Base.
 */
contract BaseBatches {
    enum PackTier {
        Bronze,
        Silver,
        Gold
    }

    struct Team {
        uint256 teamId;
        address owner;
        PackTier tier;
        bool staked;
        uint256 createdAt;
        uint256 updatedAt;
    }

    address public owner;
    uint256 public nextTeamId;
    mapping(address => uint256[]) private _userTeamIds;
    mapping(uint256 => Team) private _teams;
    mapping(PackTier => uint256) public packPrices;

    event PackPurchased(address indexed buyer, uint256 indexed teamId, PackTier tier, uint256 valuePaid);
    event TeamStakeUpdated(address indexed owner, uint256 indexed teamId, bool staked);
    event PackPriceUpdated(PackTier indexed tier, uint256 price);
    event Withdraw(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        packPrices[PackTier.Bronze] = 0.0005 ether;
        packPrices[PackTier.Silver] = 0.001 ether;
        packPrices[PackTier.Gold] = 0.002 ether;
    }

    function buyPack(PackTier tier) external payable returns (uint256 teamId) {
        uint256 price = packPrices[tier];
        require(msg.value >= price, "Insufficient payment");

        teamId = ++nextTeamId;
        _teams[teamId] = Team({
            teamId: teamId,
            owner: msg.sender,
            tier: tier,
            staked: false,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        _userTeamIds[msg.sender].push(teamId);

        emit PackPurchased(msg.sender, teamId, tier, msg.value);
    }

    function getUserTeams(address user) external view returns (Team[] memory teams) {
        uint256[] storage ids = _userTeamIds[user];
        teams = new Team[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            teams[i] = _teams[ids[i]];
        }
    }

    function getTeam(uint256 teamId) external view returns (Team memory) {
        return _teams[teamId];
    }

    function setTeamStake(uint256 teamId, bool staked) external {
        Team storage team = _teams[teamId];
        require(team.owner == msg.sender, "Not team owner");
        team.staked = staked;
        team.updatedAt = block.timestamp;
        emit TeamStakeUpdated(msg.sender, teamId, staked);
    }

    function updatePackPrice(PackTier tier, uint256 newPrice) external onlyOwner {
        packPrices[tier] = newPrice;
        emit PackPriceUpdated(tier, newPrice);
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Amount exceeds balance");
        to.transfer(amount);
        emit Withdraw(to, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    function getPackPrices() external view returns (uint256 bronze, uint256 silver, uint256 gold) {
        bronze = packPrices[PackTier.Bronze];
        silver = packPrices[PackTier.Silver];
        gold = packPrices[PackTier.Gold];
    }

    function getUserTeamIds(address user) external view returns (uint256[] memory) {
        return _userTeamIds[user];
    }
}

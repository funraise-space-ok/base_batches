// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Sports
/// @notice EVM port of the original Solana "sports" program. Handles player creation,
///         pack purchases, staking lifecycle, revenue reports and guarded withdrawals
///         for the Base network.
contract Sports {
    // -----------------------------------------------------
    // enums & structs
    // -----------------------------------------------------

    enum PlayerCategory {
        Bronze,
        Silver,
        Gold
    }

    enum PackTier {
        Bronze, // 5 random players
        Silver, // 4 random + 1 premium
        Gold // 3 random + 2 premium
    }

    enum TeamState {
        Free,
        WarmingUp,
        OnField,
        ToWithdraw
    }

    struct Player {
        uint16 id;
        uint16 providerId;
        PlayerCategory category;
        uint32 totalTokens;
        uint32 tokensSold;
        string metadataUri;
        string name;
        string discipline;
        string country;
        bool exists;
    }

    struct PlayerInput {
        uint16 providerId;
        PlayerCategory category;
        uint32 totalTokens;
        string metadataUri;
        string name;
        string discipline;
        string country;
    }

    struct Team {
        uint256 id;
        address owner;
        PackTier tier;
        TeamState state;
        uint64 createdAt;
        uint64 transitionTimestamp;
        bool termsAccepted;
        uint256 pricePaidWei;
        uint16[] playerIds;
        bool exists;
    }

    struct TeamStakeState {
        bool exists;
        TeamState state;
        uint64 transitionTimestamp;
        uint256 rewardsEarned;
    }

    struct Report {
        uint256 id;
        uint64 startTimestamp;
        uint64 endTimestamp;
        uint256 revenue;
        uint32 teamsSold;
        uint32 tokensSold;
        uint256 stakerPool;
        uint32 stakersCount;
        uint256 rewardPerStaker;
    }

    struct WithdrawalRequest {
        address requester;
        uint256 amount;
        uint64 timestamp;
        bool exists;
    }

    struct TeamView {
        uint256 teamId;
        address owner;
        uint8 tier;
        bool staked;
        uint64 createdAt;
        uint64 updatedAt;
    }

    // -----------------------------------------------------
    // storage
    // -----------------------------------------------------

    address public owner;
    mapping(address => bool) public staff;
    uint8 public staffCount;
    uint8 public constant MAX_STAFF = 3;

    uint16 public nextPlayerId = 1;
    uint256 public nextTeamId = 1;

    mapping(uint16 => Player) private _players;
    uint16[] private _playerIds;

    mapping(uint256 => Team) private _teams;
    mapping(address => uint256[]) private _userTeams;

    mapping(address => mapping(uint256 => TeamStakeState)) private _teamStakeState;

    uint256[3] private _packPricesWei;
    uint64 public timeLockSeconds = 24 hours;
    bool public isPaused;

    uint256 public currentReportId = 1;
    uint64 public currentReportStart;
    bool public isReportOpen = true;
    uint256 public currentReportRevenue;
    uint32 public currentReportTeams;
    uint32 public currentReportTokens;
    mapping(uint256 => Report) public reports;

    WithdrawalRequest public pendingWithdrawal;
    string public metadataBaseUri;

    // -----------------------------------------------------
    // events
    // -----------------------------------------------------

    event PackPurchased(
        address indexed buyer,
        uint256 indexed teamId,
        uint8 tier,
        uint256 valuePaid
    );

    event TokenSold(uint16 indexed playerId, uint256 indexed teamId, address indexed buyer);
    event TeamStateChanged(uint256 indexed teamId, TeamState newState);
    event TeamStakeLifecycle(uint256 indexed teamId, TeamState state, uint64 timestamp);
    event ReportClosed(uint256 indexed reportId);
    event WithdrawalRequested(address indexed requester, uint256 amount);
    event WithdrawalApproved(address indexed approver, uint256 amount);
    event StaffUpdated(address indexed account, bool added);
    event PricesUpdated(uint256 priceBronze, uint256 priceSilver, uint256 priceGold);

    // -----------------------------------------------------
    // modifiers
    // -----------------------------------------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorized() {
        require(_isAuthorized(msg.sender), "Not authorized");
        _;
    }

    modifier notPaused() {
        require(!isPaused, "Contract paused");
        _;
    }

    // -----------------------------------------------------
    // constructor
    // -----------------------------------------------------

    constructor(
        uint256 priceBronzeWei,
        uint256 priceSilverWei,
        uint256 priceGoldWei,
        string memory baseUri,
        uint64 lockSeconds
    ) {
        require(priceBronzeWei > 0 && priceSilverWei > 0 && priceGoldWei > 0, "Invalid prices");
        owner = msg.sender;
        _packPricesWei[0] = priceBronzeWei;
        _packPricesWei[1] = priceSilverWei;
        _packPricesWei[2] = priceGoldWei;
        metadataBaseUri = baseUri;
        currentReportStart = uint64(block.timestamp);
        if (lockSeconds > 0) {
            timeLockSeconds = lockSeconds;
        }
    }

    // -----------------------------------------------------
    // admin/staff management
    // -----------------------------------------------------

    function addStaff(address account) external onlyOwner {
        require(account != address(0), "Zero address");
        require(!staff[account], "Already staff");
        require(staffCount < MAX_STAFF, "Staff limit");
        staff[account] = true;
        staffCount += 1;
        emit StaffUpdated(account, true);
    }

    function removeStaff(address account) external onlyOwner {
        require(staff[account], "Not staff");
        staff[account] = false;
        if (staffCount > 0) {
            staffCount -= 1;
        }
        emit StaffUpdated(account, false);
    }

    function pause() external onlyAuthorized {
        isPaused = true;
    }

    function unpause() external onlyAuthorized {
        isPaused = false;
    }

    function setPackPrices(
        uint256 priceBronzeWei,
        uint256 priceSilverWei,
        uint256 priceGoldWei
    ) external onlyAuthorized {
        require(priceBronzeWei > 0 && priceSilverWei > 0 && priceGoldWei > 0, "Invalid price");
        _packPricesWei[0] = priceBronzeWei;
        _packPricesWei[1] = priceSilverWei;
        _packPricesWei[2] = priceGoldWei;
        emit PricesUpdated(priceBronzeWei, priceSilverWei, priceGoldWei);
    }

    function setTimeLock(uint64 newTimeLockSeconds) external onlyAuthorized {
        require(newTimeLockSeconds > 0, "Invalid timelock");
        timeLockSeconds = newTimeLockSeconds;
    }

    function setMetadataBaseUri(string calldata newUri) external onlyAuthorized {
        metadataBaseUri = newUri;
    }

    function toggleReportOpen(bool open) external onlyAuthorized {
        isReportOpen = open;
    }

    // -----------------------------------------------------
    // player management
    // -----------------------------------------------------

    function createPlayer(
        uint16 providerId,
        PlayerCategory category,
        uint32 totalTokens,
        string calldata metadataUri,
        string calldata name,
        string calldata discipline,
        string calldata country
    ) external onlyAuthorized {
        PlayerInput memory input = PlayerInput({
            providerId: providerId,
            category: category,
            totalTokens: totalTokens,
            metadataUri: metadataUri,
            name: name,
            discipline: discipline,
            country: country
        });
        _createPlayerInternal(input);
    }

    function createPlayersBatch(PlayerInput[] calldata inputs) external onlyAuthorized {
        require(inputs.length > 0, "Empty batch");
        for (uint256 i = 0; i < inputs.length; i++) {
            _createPlayerInternal(inputs[i]);
        }
    }

    function updatePlayer(
        uint16 playerId,
        uint16 providerId,
        PlayerCategory category,
        uint32 totalTokens,
        string calldata metadataUri,
        string calldata name,
        string calldata discipline,
        string calldata country
    ) external onlyAuthorized {
        Player storage player = _players[playerId];
        require(player.exists, "Player not found");
        require(totalTokens >= player.tokensSold, "Below sold supply");

        player.providerId = providerId;
        player.category = category;
        player.totalTokens = totalTokens;
        player.metadataUri = metadataUri;
        player.name = name;
        player.discipline = discipline;
        player.country = country;
    }

    function addTokens(uint16 playerId, uint32 tokensToAdd) external onlyAuthorized {
        Player storage player = _players[playerId];
        require(player.exists, "Player not found");
        require(tokensToAdd > 0, "Zero tokens");
        player.totalTokens += tokensToAdd;
    }

    function resetAvailableTokens(uint16 playerId) external onlyAuthorized {
        Player storage player = _players[playerId];
        require(player.exists, "Player not found");
        player.tokensSold = player.totalTokens;
    }

    function getPlayer(uint16 playerId) external view returns (Player memory) {
        return _players[playerId];
    }

    function getAllPlayerIds() external view returns (uint16[] memory) {
        return _playerIds;
    }

    // -----------------------------------------------------
    // pack purchase
    // -----------------------------------------------------

    function getPackPrices() external view returns (uint256 bronze, uint256 silver, uint256 gold) {
        bronze = _packPricesWei[0];
        silver = _packPricesWei[1];
        gold = _packPricesWei[2];
    }

    function buyPack(PackTier tier, bool termsAccepted) external payable notPaused {
        require(isReportOpen, "Report closed");
        require(termsAccepted, "Terms not accepted");

        uint8 tierIndex = uint8(tier);
        require(tierIndex < 3, "Invalid tier");
        uint256 price = _packPricesWei[tierIndex];
        require(price > 0, "Price not set");
        require(msg.value == price, "Incorrect payment");

        (uint16[] memory selectedIds, PlayerCategory[] memory selectedCategories) = _selectPlayers(
            tier,
            msg.sender,
            nextTeamId
        );

        uint256 teamId = nextTeamId;
        nextTeamId += 1;

        Team storage team = _teams[teamId];
        team.id = teamId;
        team.owner = msg.sender;
        team.tier = tier;
        team.state = TeamState.Free;
        team.createdAt = uint64(block.timestamp);
        team.transitionTimestamp = uint64(block.timestamp);
        team.termsAccepted = termsAccepted;
        team.pricePaidWei = price;
        team.playerIds = selectedIds;
        team.exists = true;

        _userTeams[msg.sender].push(teamId);

        currentReportRevenue += price;
        currentReportTeams += 1;
        currentReportTokens += uint32(selectedIds.length);

        emit PackPurchased(msg.sender, teamId, tierIndex, price);
        for (uint256 i = 0; i < selectedIds.length; i++) {
            emit TokenSold(selectedIds[i], teamId, msg.sender);
            _decrementPlayerAvailability(selectedIds[i], selectedCategories[i]);
        }
    }

    function _decrementPlayerAvailability(uint16 playerId, PlayerCategory /*category*/) internal {
        Player storage player = _players[playerId];
        require(player.exists, "Player missing");
        require(player.tokensSold < player.totalTokens, "Sold out");
        player.tokensSold += 1;
    }

    function _selectPlayers(
        PackTier tier,
        address buyer,
        uint256 teamId
    ) internal view returns (uint16[] memory ids, PlayerCategory[] memory categories) {
        (uint16[] memory availableIds, PlayerCategory[] memory availableCats) = _availablePlayers();
        uint256 required = 5;
        require(availableIds.length >= required, "Insufficient players");

        uint16[] memory chosen = new uint16[](required);
        PlayerCategory[] memory chosenCats = new PlayerCategory[](required);
        bool[] memory picked = new bool[](availableIds.length);

        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    msg.sender,
                    buyer,
                    teamId
                )
            )
        );

        uint256 count = 0;
        while (count < required) {
            seed = uint256(keccak256(abi.encode(seed, count)));
            uint256 idx = seed % availableIds.length;
            if (picked[idx]) {
                continue;
            }
            picked[idx] = true;
            chosen[count] = availableIds[idx];
            chosenCats[count] = availableCats[idx];
            count++;
        }

        uint256 premiumCount = _countPremium(chosenCats);
        uint256 requiredPremium = tier == PackTier.Silver ? 1 : (tier == PackTier.Gold ? 2 : 0);
        if (premiumCount < requiredPremium) {
            uint256 toAcquire = requiredPremium - premiumCount;
            for (uint256 i = 0; i < availableIds.length && toAcquire > 0; i++) {
                if (picked[i]) continue;
                if (_isPremium(availableCats[i])) {
                    bool replaced = false;
                    for (uint256 j = 0; j < chosenCats.length; j++) {
                        if (!_isPremium(chosenCats[j])) {
                            chosen[j] = availableIds[i];
                            chosenCats[j] = availableCats[i];
                            picked[i] = true;
                            toAcquire--;
                            replaced = true;
                            break;
                        }
                    }
                    if (!replaced) break;
                }
            }
            require(toAcquire == 0, "Insufficient premium players");
        }

        ids = chosen;
        categories = chosenCats;
    }

    function _availablePlayers()
        internal
        view
        returns (uint16[] memory ids, PlayerCategory[] memory categories)
    {
        uint256 available = 0;
        for (uint256 i = 0; i < _playerIds.length; i++) {
            Player storage player = _players[_playerIds[i]];
            if (player.exists && player.totalTokens > player.tokensSold) {
                available++;
            }
        }
        ids = new uint16[](available);
        categories = new PlayerCategory[](available);
        uint256 cursor = 0;
        for (uint256 i = 0; i < _playerIds.length; i++) {
            Player storage player = _players[_playerIds[i]];
            if (player.exists && player.totalTokens > player.tokensSold) {
                ids[cursor] = player.id;
                categories[cursor] = player.category;
                cursor++;
            }
        }
    }

    function _countPremium(PlayerCategory[] memory categories) internal pure returns (uint256) {
        uint256 premium;
        for (uint256 i = 0; i < categories.length; i++) {
            if (_isPremium(categories[i])) {
                premium++;
            }
        }
        return premium;
    }

    function _isPremium(PlayerCategory category) internal pure returns (bool) {
        return category == PlayerCategory.Silver || category == PlayerCategory.Gold;
    }

    function _createPlayerInternal(PlayerInput memory input) internal {
        require(input.totalTokens > 0, "Zero tokens");

        uint16 playerId = nextPlayerId;
        nextPlayerId += 1;

        Player storage player = _players[playerId];
        player.id = playerId;
        player.providerId = input.providerId;
        player.category = input.category;
        player.totalTokens = input.totalTokens;
        player.tokensSold = 0;
        player.metadataUri = input.metadataUri;
        player.name = input.name;
        player.discipline = input.discipline;
        player.country = input.country;
        player.exists = true;

        _playerIds.push(playerId);
    }

    // -----------------------------------------------------
    // team queries
    // -----------------------------------------------------

    function getUserTeams(address user) external view returns (TeamView[] memory) {
        uint256[] storage teamIds = _userTeams[user];
        TeamView[] memory viewTeams = new TeamView[](teamIds.length);
        for (uint256 i = 0; i < teamIds.length; i++) {
            Team storage team = _teams[teamIds[i]];
            viewTeams[i] = _buildTeamView(team);
        }
        return viewTeams;
    }

    function getTeam(uint256 teamId) external view returns (TeamView memory) {
        Team storage team = _teams[teamId];
        require(team.exists, "Team not found");
        return _buildTeamView(team);
    }

    function getTeamDetail(uint256 teamId)
        external
        view
        returns (Team memory team, TeamStakeState memory stake)
    {
        team = _teams[teamId];
        require(team.exists, "Team not found");
        stake = _teamStakeState[team.owner][teamId];
    }

    function _buildTeamView(Team storage team) internal view returns (TeamView memory viewTeam) {
        bool staked = team.state != TeamState.Free;
        viewTeam = TeamView({
            teamId: team.id,
            owner: team.owner,
            tier: uint8(team.tier),
            staked: staked,
            createdAt: team.createdAt,
            updatedAt: team.transitionTimestamp
        });
    }

    // -----------------------------------------------------
    // staking lifecycle
    // -----------------------------------------------------

    function setTeamStake(uint256 teamId, bool stake) external notPaused {
        Team storage team = _teams[teamId];
        require(team.exists, "Team not found");
        require(team.owner == msg.sender, "Not owner");

        TeamStakeState storage stakeState = _teamStakeState[msg.sender][teamId];

        if (stake) {
            require(team.state == TeamState.Free, "Invalid state");
            team.state = TeamState.WarmingUp;
            team.transitionTimestamp = uint64(block.timestamp);
            stakeState.exists = true;
            stakeState.state = TeamState.WarmingUp;
            stakeState.transitionTimestamp = uint64(block.timestamp);
            emit TeamStateChanged(teamId, TeamState.WarmingUp);
            emit TeamStakeLifecycle(teamId, TeamState.WarmingUp, uint64(block.timestamp));
        } else {
            require(
                team.state == TeamState.OnField || team.state == TeamState.WarmingUp,
                "Not staked"
            );
            team.state = TeamState.ToWithdraw;
            team.transitionTimestamp = uint64(block.timestamp);
            stakeState.state = TeamState.ToWithdraw;
            stakeState.transitionTimestamp = uint64(block.timestamp);
            emit TeamStateChanged(teamId, TeamState.ToWithdraw);
            emit TeamStakeLifecycle(teamId, TeamState.ToWithdraw, uint64(block.timestamp));
        }
    }

    function refreshTeamStatus(uint256 teamId) external {
        Team storage team = _teams[teamId];
        require(team.exists, "Team not found");
        TeamStakeState storage stakeState = _teamStakeState[team.owner][teamId];

        if (team.state == TeamState.WarmingUp) {
            if (block.timestamp >= team.transitionTimestamp + timeLockSeconds) {
                team.state = TeamState.OnField;
                team.transitionTimestamp = uint64(block.timestamp);
                stakeState.state = TeamState.OnField;
                stakeState.transitionTimestamp = uint64(block.timestamp);
                emit TeamStateChanged(teamId, TeamState.OnField);
                emit TeamStakeLifecycle(teamId, TeamState.OnField, uint64(block.timestamp));
            }
        } else if (team.state == TeamState.ToWithdraw) {
            if (block.timestamp >= team.transitionTimestamp + timeLockSeconds) {
                team.state = TeamState.Free;
                team.transitionTimestamp = uint64(block.timestamp);
                delete _teamStakeState[team.owner][teamId];
                emit TeamStateChanged(teamId, TeamState.Free);
                emit TeamStakeLifecycle(teamId, TeamState.Free, uint64(block.timestamp));
            }
        }
    }

    // -----------------------------------------------------
    // report & withdrawal
    // -----------------------------------------------------

    function closeReport(
        uint256 revenue,
        uint32 teamsSold,
        uint32 tokensSold,
        uint256 stakerPool,
        uint32 stakersCount
    ) external onlyAuthorized {
        require(isReportOpen, "Report already closed");
        require(revenue <= currentReportRevenue, "Revenue exceeds balance");

        Report storage report = reports[currentReportId];
        report.id = currentReportId;
        report.startTimestamp = currentReportStart;
        report.endTimestamp = uint64(block.timestamp);
        report.revenue = revenue;
        report.teamsSold = teamsSold;
        report.tokensSold = tokensSold;
        report.stakerPool = stakerPool;
        report.stakersCount = stakersCount;
        report.rewardPerStaker = stakersCount > 0 ? stakerPool / stakersCount : 0;

        currentReportId += 1;
        currentReportStart = uint64(block.timestamp);
        currentReportRevenue = 0;
        currentReportTeams = 0;
        currentReportTokens = 0;
        isReportOpen = true;

        emit ReportClosed(report.id);
    }

    function withdraw(uint256 amount) external onlyAuthorized {
        require(amount > 0, "Zero amount");
        require(amount <= address(this).balance, "Insufficient balance");
        require(amount <= currentReportRevenue, "Exceeds revenue");

        if (!pendingWithdrawal.exists) {
        pendingWithdrawal = WithdrawalRequest({
            requester: msg.sender,
            amount: amount,
            timestamp: uint64(block.timestamp),
            exists: true
        });
            emit WithdrawalRequested(msg.sender, amount);
            return;
        }

        require(pendingWithdrawal.requester != msg.sender, "Cannot self approve");
        require(pendingWithdrawal.amount == amount, "Amount mismatch");

        address beneficiary = pendingWithdrawal.requester;
        pendingWithdrawal = WithdrawalRequest({
            requester: address(0),
            amount: 0,
            timestamp: 0,
            exists: false
        });
        currentReportRevenue -= amount;

        (bool ok, ) = beneficiary.call{value: amount}("");
        require(ok, "Transfer failed");

        emit WithdrawalApproved(msg.sender, amount);
    }

    // -----------------------------------------------------
    // views
    // -----------------------------------------------------

    function getPendingWithdrawal()
        external
        view
        returns (address requester, uint256 amount, uint64 timestamp, bool exists)
    {
        WithdrawalRequest memory req = pendingWithdrawal;
        return (req.requester, req.amount, req.timestamp, req.exists);
    }

    function getUserTeamIds(address user) external view returns (uint256[] memory) {
        return _userTeams[user];
    }

    function getPlayersByIds(uint16[] calldata ids) external view returns (Player[] memory players) {
        players = new Player[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            Player storage stored = _players[ids[i]];
            require(stored.exists, "Player not found");
            players[i] = stored;
        }
    }

    // -----------------------------------------------------
    // helpers
    // -----------------------------------------------------

    function _isAuthorized(address account) internal view returns (bool) {
        if (account == owner) {
            return true;
        }
        return staff[account];
    }

    receive() external payable {}
}

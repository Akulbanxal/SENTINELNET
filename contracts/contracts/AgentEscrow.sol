// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AgentEscrow
 * @dev Enables secure agent-to-agent payments with escrow mechanism
 * @notice Handles payment locking, milestone tracking, and automatic releases
 */
contract AgentEscrow is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");
    
    /// @notice Status of escrow transactions
    enum EscrowStatus { 
        Created,        // Escrow created, payment locked
        Active,         // Work in progress
        Completed,      // Work completed, awaiting confirmation
        Released,       // Payment released to provider
        Refunded,       // Payment refunded to requester
        Disputed,       // Dispute raised
        Cancelled       // Escrow cancelled
    }
    
    /// @notice Payment milestone structure
    struct Milestone {
        string description;
        uint256 amount;
        uint256 deadline;
        bool completed;
        bool paid;
    }
    
    /**
     * @notice Complete escrow transaction details
     * @dev Stores all information about an agent-to-agent payment
     */
    struct EscrowTransaction {
        uint256 escrowId;
        address requester;          // Agent requesting service
        address provider;           // Agent providing service
        address paymentToken;       // Token used for payment (address(0) for ETH)
        uint256 totalAmount;        // Total payment amount
        uint256 remainingAmount;    // Amount still locked
        uint256 platformFee;        // Platform fee amount
        uint256 createdAt;
        uint256 deadline;
        EscrowStatus status;
        bool requiresMilestones;
        Milestone[] milestones;
        string serviceDescription;
        string disputeReason;
    }
    
    // State variables
    mapping(uint256 => EscrowTransaction) public escrows;
    mapping(address => uint256[]) public requesterEscrows;
    mapping(address => uint256[]) public providerEscrows;
    mapping(address => uint256) public agentEarnings;
    mapping(address => uint256) public agentCompletedJobs;
    
    uint256 public escrowCounter;
    uint256 public platformFeePercent = 250; // 2.5% in basis points (100 bp = 1%)
    address public platformWallet;
    uint256 public constant MAX_FEE = 1000; // 10% maximum fee
    uint256 public constant MIN_ESCROW_AMOUNT = 0.001 ether;
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed requester,
        address indexed provider,
        uint256 amount,
        address paymentToken
    );
    
    event MilestoneAdded(
        uint256 indexed escrowId,
        uint256 milestoneIndex,
        string description,
        uint256 amount
    );
    
    event MilestoneCompleted(
        uint256 indexed escrowId,
        uint256 milestoneIndex,
        uint256 amount
    );
    
    event PaymentReleased(
        uint256 indexed escrowId,
        address indexed provider,
        uint256 amount,
        uint256 platformFee
    );
    
    event PaymentRefunded(
        uint256 indexed escrowId,
        address indexed requester,
        uint256 amount
    );
    
    event DisputeRaised(
        uint256 indexed escrowId,
        address indexed raiser,
        string reason
    );
    
    event DisputeResolved(
        uint256 indexed escrowId,
        address indexed resolver,
        bool providerWins
    );
    
    event EscrowCancelled(uint256 indexed escrowId);
    event PlatformFeeUpdated(uint256 newFeePercent);
    event PlatformWalletUpdated(address newWallet);
    
    /**
     * @notice Contract constructor
     * @param _platformWallet Address to receive platform fees
     */
    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        
        platformWallet = _platformWallet;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ROLE, msg.sender);
        _grantRole(ARBITRATOR_ROLE, msg.sender);
    }
    
    /**
     * @notice Create a new escrow transaction with ETH
     * @dev Requester locks payment for provider
     * @param _provider Agent providing the service
     * @param _deadline Unix timestamp for completion deadline
     * @param _serviceDescription Description of service requested
     * @return escrowId The ID of the created escrow
     */
    function createEscrowETH(
        address _provider,
        uint256 _deadline,
        string memory _serviceDescription
    ) external payable nonReentrant returns (uint256) {
        require(_provider != address(0), "Invalid provider");
        require(_provider != msg.sender, "Cannot escrow to self");
        require(msg.value >= MIN_ESCROW_AMOUNT, "Amount too low");
        require(_deadline > block.timestamp, "Invalid deadline");
        require(bytes(_serviceDescription).length > 0, "Description required");
        
        uint256 platformFee = (msg.value * platformFeePercent) / 10000;
        uint256 netAmount = msg.value - platformFee;
        
        return _createEscrow(
            msg.sender,
            _provider,
            address(0), // ETH
            netAmount,
            platformFee,
            _deadline,
            _serviceDescription
        );
    }
    
    /**
     * @notice Create a new escrow transaction with ERC20 tokens
     * @dev Requester must approve this contract first
     * @param _provider Agent providing the service
     * @param _paymentToken ERC20 token address
     * @param _amount Amount of tokens
     * @param _deadline Unix timestamp for completion deadline
     * @param _serviceDescription Description of service requested
     * @return escrowId The ID of the created escrow
     */
    function createEscrowERC20(
        address _provider,
        address _paymentToken,
        uint256 _amount,
        uint256 _deadline,
        string memory _serviceDescription
    ) external nonReentrant returns (uint256) {
        require(_provider != address(0), "Invalid provider");
        require(_provider != msg.sender, "Cannot escrow to self");
        require(_paymentToken != address(0), "Invalid token");
        require(_amount > 0, "Amount must be positive");
        require(_deadline > block.timestamp, "Invalid deadline");
        require(bytes(_serviceDescription).length > 0, "Description required");
        
        uint256 platformFee = (_amount * platformFeePercent) / 10000;
        uint256 netAmount = _amount - platformFee;
        
        // Transfer tokens from requester to this contract
        IERC20(_paymentToken).safeTransferFrom(msg.sender, address(this), _amount);
        
        return _createEscrow(
            msg.sender,
            _provider,
            _paymentToken,
            netAmount,
            platformFee,
            _deadline,
            _serviceDescription
        );
    }
    
    /**
     * @notice Internal function to create escrow
     * @dev Common logic for ETH and ERC20 escrows
     */
    function _createEscrow(
        address _requester,
        address _provider,
        address _paymentToken,
        uint256 _amount,
        uint256 _platformFee,
        uint256 _deadline,
        string memory _serviceDescription
    ) internal returns (uint256) {
        escrowCounter++;
        uint256 escrowId = escrowCounter;
        
        EscrowTransaction storage escrow = escrows[escrowId];
        escrow.escrowId = escrowId;
        escrow.requester = _requester;
        escrow.provider = _provider;
        escrow.paymentToken = _paymentToken;
        escrow.totalAmount = _amount;
        escrow.remainingAmount = _amount;
        escrow.platformFee = _platformFee;
        escrow.createdAt = block.timestamp;
        escrow.deadline = _deadline;
        escrow.status = EscrowStatus.Created;
        escrow.serviceDescription = _serviceDescription;
        
        requesterEscrows[_requester].push(escrowId);
        providerEscrows[_provider].push(escrowId);
        
        emit EscrowCreated(escrowId, _requester, _provider, _amount, _paymentToken);
        
        return escrowId;
    }
    
    /**
     * @notice Add milestone to an escrow
     * @dev Only requester can add milestones before work starts
     * @param _escrowId Escrow ID
     * @param _description Milestone description
     * @param _amount Amount for this milestone
     * @param _deadline Milestone deadline
     */
    function addMilestone(
        uint256 _escrowId,
        string memory _description,
        uint256 _amount,
        uint256 _deadline
    ) external {
        EscrowTransaction storage escrow = escrows[_escrowId];
        require(escrow.requester == msg.sender, "Only requester");
        require(escrow.status == EscrowStatus.Created, "Cannot add milestones");
        require(_amount > 0 && _amount <= escrow.remainingAmount, "Invalid amount");
        require(_deadline > block.timestamp && _deadline <= escrow.deadline, "Invalid deadline");
        require(bytes(_description).length > 0, "Description required");
        
        Milestone memory milestone = Milestone({
            description: _description,
            amount: _amount,
            deadline: _deadline,
            completed: false,
            paid: false
        });
        
        escrow.milestones.push(milestone);
        escrow.requiresMilestones = true;
        
        emit MilestoneAdded(_escrowId, escrow.milestones.length - 1, _description, _amount);
    }
    
    /**
     * @notice Provider marks work as started
     * @param _escrowId Escrow ID
     */
    function startWork(uint256 _escrowId) external {
        EscrowTransaction storage escrow = escrows[_escrowId];
        require(escrow.provider == msg.sender, "Only provider");
        require(escrow.status == EscrowStatus.Created, "Invalid status");
        
        escrow.status = EscrowStatus.Active;
    }
    
    /**
     * @notice Provider marks work as completed
     * @param _escrowId Escrow ID
     */
    function completeWork(uint256 _escrowId) external {
        EscrowTransaction storage escrow = escrows[_escrowId];
        require(escrow.provider == msg.sender, "Only provider");
        require(escrow.status == EscrowStatus.Active, "Work not active");
        
        escrow.status = EscrowStatus.Completed;
    }
    
    /**
     * @notice Requester marks milestone as completed
     * @dev Automatically releases payment for the milestone
     * @param _escrowId Escrow ID
     * @param _milestoneIndex Index of the milestone
     */
    function completeMilestone(
        uint256 _escrowId,
        uint256 _milestoneIndex
    ) external nonReentrant {
        EscrowTransaction storage escrow = escrows[_escrowId];
        require(escrow.requester == msg.sender, "Only requester");
        require(escrow.status == EscrowStatus.Active, "Work not active");
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone");
        
        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        require(!milestone.completed, "Already completed");
        require(!milestone.paid, "Already paid");
        
        milestone.completed = true;
        milestone.paid = true;
        
        // Release milestone payment
        _transferPayment(escrow.paymentToken, escrow.provider, milestone.amount);
        escrow.remainingAmount -= milestone.amount;
        
        // Update earnings
        agentEarnings[escrow.provider] += milestone.amount;
        
        emit MilestoneCompleted(_escrowId, _milestoneIndex, milestone.amount);
        
        // Check if all milestones completed
        bool allCompleted = true;
        for (uint256 i = 0; i < escrow.milestones.length; i++) {
            if (!escrow.milestones[i].completed) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted && escrow.remainingAmount == 0) {
            escrow.status = EscrowStatus.Released;
            agentCompletedJobs[escrow.provider]++;
        }
    }
    
    /**
     * @notice Release full payment to provider
     * @dev Can be called by requester after work completion or automatically after deadline
     * @param _escrowId Escrow ID
     */
    function releasePayment(uint256 _escrowId) external nonReentrant {
        EscrowTransaction storage escrow = escrows[_escrowId];
        require(
            msg.sender == escrow.requester || 
            msg.sender == escrow.provider ||
            hasRole(PLATFORM_ROLE, msg.sender),
            "Unauthorized"
        );
        require(
            escrow.status == EscrowStatus.Completed || 
            (escrow.status == EscrowStatus.Active && block.timestamp > escrow.deadline),
            "Cannot release yet"
        );
        require(escrow.remainingAmount > 0, "No funds to release");
        
        uint256 amount = escrow.remainingAmount;
        escrow.remainingAmount = 0;
        escrow.status = EscrowStatus.Released;
        
        // Transfer to provider
        _transferPayment(escrow.paymentToken, escrow.provider, amount);
        
        // Transfer platform fee
        _transferPayment(escrow.paymentToken, platformWallet, escrow.platformFee);
        
        // Update stats
        agentEarnings[escrow.provider] += amount;
        agentCompletedJobs[escrow.provider]++;
        
        emit PaymentReleased(_escrowId, escrow.provider, amount, escrow.platformFee);
    }
    
    /**
     * @notice Refund payment to requester
     * @dev Can only be called before work starts or by arbitrator
     * @param _escrowId Escrow ID
     */
    function refundPayment(uint256 _escrowId) external nonReentrant {
        EscrowTransaction storage escrow = escrows[_escrowId];
        require(
            (msg.sender == escrow.requester && escrow.status == EscrowStatus.Created) ||
            hasRole(ARBITRATOR_ROLE, msg.sender),
            "Unauthorized"
        );
        require(escrow.status != EscrowStatus.Released, "Already released");
        require(escrow.status != EscrowStatus.Refunded, "Already refunded");
        require(escrow.remainingAmount > 0, "No funds to refund");
        
        uint256 amount = escrow.remainingAmount;
        uint256 feeRefund = escrow.platformFee;
        
        escrow.remainingAmount = 0;
        escrow.platformFee = 0;
        escrow.status = EscrowStatus.Refunded;
        
        // Refund to requester including platform fee
        _transferPayment(escrow.paymentToken, escrow.requester, amount + feeRefund);
        
        emit PaymentRefunded(_escrowId, escrow.requester, amount + feeRefund);
    }
    
    /**
     * @notice Raise a dispute
     * @dev Can be called by requester or provider
     * @param _escrowId Escrow ID
     * @param _reason Reason for dispute
     */
    function raiseDispute(
        uint256 _escrowId,
        string memory _reason
    ) external {
        EscrowTransaction storage escrow = escrows[_escrowId];
        require(
            msg.sender == escrow.requester || msg.sender == escrow.provider,
            "Unauthorized"
        );
        require(
            escrow.status == EscrowStatus.Active || 
            escrow.status == EscrowStatus.Completed,
            "Cannot dispute"
        );
        require(bytes(_reason).length > 0, "Reason required");
        
        escrow.status = EscrowStatus.Disputed;
        escrow.disputeReason = _reason;
        
        emit DisputeRaised(_escrowId, msg.sender, _reason);
    }
    
    /**
     * @notice Resolve a dispute
     * @dev Only arbitrator can resolve disputes
     * @param _escrowId Escrow ID
     * @param _providerWins True if provider should receive payment
     */
    function resolveDispute(
        uint256 _escrowId,
        bool _providerWins
    ) external nonReentrant onlyRole(ARBITRATOR_ROLE) {
        EscrowTransaction storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Disputed, "Not disputed");
        require(escrow.remainingAmount > 0, "No funds");
        
        uint256 amount = escrow.remainingAmount;
        escrow.remainingAmount = 0;
        
        if (_providerWins) {
            escrow.status = EscrowStatus.Released;
            _transferPayment(escrow.paymentToken, escrow.provider, amount);
            _transferPayment(escrow.paymentToken, platformWallet, escrow.platformFee);
            agentEarnings[escrow.provider] += amount;
            agentCompletedJobs[escrow.provider]++;
        } else {
            escrow.status = EscrowStatus.Refunded;
            _transferPayment(escrow.paymentToken, escrow.requester, amount + escrow.platformFee);
            escrow.platformFee = 0;
        }
        
        emit DisputeResolved(_escrowId, msg.sender, _providerWins);
    }
    
    /**
     * @notice Cancel escrow before work starts
     * @dev Only requester can cancel
     * @param _escrowId Escrow ID
     */
    function cancelEscrow(uint256 _escrowId) external nonReentrant {
        EscrowTransaction storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.requester, "Only requester");
        require(escrow.status == EscrowStatus.Created, "Cannot cancel");
        require(escrow.remainingAmount > 0, "No funds");
        
        uint256 amount = escrow.remainingAmount;
        uint256 feeRefund = escrow.platformFee;
        
        escrow.remainingAmount = 0;
        escrow.platformFee = 0;
        escrow.status = EscrowStatus.Cancelled;
        
        _transferPayment(escrow.paymentToken, escrow.requester, amount + feeRefund);
        
        emit EscrowCancelled(_escrowId);
    }
    
    /**
     * @notice Internal function to transfer payments
     * @dev Handles both ETH and ERC20 transfers
     */
    function _transferPayment(
        address _token,
        address _to,
        uint256 _amount
    ) internal {
        if (_amount == 0) return;
        
        if (_token == address(0)) {
            // ETH transfer
            (bool success, ) = _to.call{value: _amount}("");
            require(success, "ETH transfer failed");
        } else {
            // ERC20 transfer
            IERC20(_token).safeTransfer(_to, _amount);
        }
    }
    
    /**
     * @notice Get escrow details
     * @param _escrowId Escrow ID
     * @return Escrow transaction details
     */
    function getEscrow(uint256 _escrowId) external view returns (
        address requester,
        address provider,
        address paymentToken,
        uint256 totalAmount,
        uint256 remainingAmount,
        uint256 deadline,
        EscrowStatus status,
        string memory serviceDescription
    ) {
        EscrowTransaction storage escrow = escrows[_escrowId];
        return (
            escrow.requester,
            escrow.provider,
            escrow.paymentToken,
            escrow.totalAmount,
            escrow.remainingAmount,
            escrow.deadline,
            escrow.status,
            escrow.serviceDescription
        );
    }
    
    /**
     * @notice Get milestones for an escrow
     * @param _escrowId Escrow ID
     * @return Array of milestones
     */
    function getMilestones(uint256 _escrowId) external view returns (Milestone[] memory) {
        return escrows[_escrowId].milestones;
    }
    
    /**
     * @notice Get all escrows where address is requester
     * @param _requester Requester address
     * @return Array of escrow IDs
     */
    function getRequesterEscrows(address _requester) external view returns (uint256[] memory) {
        return requesterEscrows[_requester];
    }
    
    /**
     * @notice Get all escrows where address is provider
     * @param _provider Provider address
     * @return Array of escrow IDs
     */
    function getProviderEscrows(address _provider) external view returns (uint256[] memory) {
        return providerEscrows[_provider];
    }
    
    /**
     * @notice Get agent statistics
     * @param _agent Agent address
     * @return totalEarnings Total amount earned
     * @return completedJobs Number of completed jobs
     */
    function getAgentStats(address _agent) external view returns (
        uint256 totalEarnings,
        uint256 completedJobs
    ) {
        return (agentEarnings[_agent], agentCompletedJobs[_agent]);
    }
    
    /**
     * @notice Update platform fee
     * @dev Only admin can update
     * @param _newFeePercent New fee in basis points
     */
    function updatePlatformFee(uint256 _newFeePercent) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newFeePercent <= MAX_FEE, "Fee too high");
        platformFeePercent = _newFeePercent;
        emit PlatformFeeUpdated(_newFeePercent);
    }
    
    /**
     * @notice Update platform wallet
     * @dev Only admin can update
     * @param _newWallet New platform wallet address
     */
    function updatePlatformWallet(address _newWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newWallet != address(0), "Invalid address");
        platformWallet = _newWallet;
        emit PlatformWalletUpdated(_newWallet);
    }
    
    /**
     * @notice Grant arbitrator role
     * @param _arbitrator Address to grant role
     */
    function grantArbitratorRole(address _arbitrator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ARBITRATOR_ROLE, _arbitrator);
    }
    
    // Receive ETH
    receive() external payable {}
}

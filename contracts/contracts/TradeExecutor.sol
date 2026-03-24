// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Import interfaces for audit registry
interface IAuditRegistry {
    function isTokenSafe(address _tokenAddress) external view returns (bool isSafe, uint8 overallScore);
}

/**
 * @title TradeExecutor
 * @dev Executes simulated trades only if risk score is below threshold
 * @notice This contract integrates with AuditRegistry to ensure only safe tokens are traded
 */
contract TradeExecutor is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    bytes32 public constant TRADER_ROLE = keccak256("TRADER_ROLE");
    bytes32 public constant RISK_MANAGER_ROLE = keccak256("RISK_MANAGER_ROLE");
    
    /// @notice Trade execution status
    enum TradeStatus {
        Pending,        // Trade initiated, awaiting approval
        Approved,       // Risk check passed, ready to execute
        Executed,       // Trade successfully executed
        Rejected,       // Risk check failed
        Failed,         // Execution failed
        Cancelled       // Trade cancelled
    }
    
    /// @notice Trade direction
    enum TradeDirection {
        Buy,
        Sell
    }
    
    /**
     * @notice Complete trade order structure
     * @dev Stores all trade parameters and execution details
     */
    struct TradeOrder {
        uint256 orderId;
        address trader;
        address tokenAddress;
        TradeDirection direction;
        uint256 amount;             // Amount of tokens to trade
        uint256 expectedPrice;      // Expected price per token
        uint256 slippage;           // Max slippage in basis points
        uint256 deadline;           // Execution deadline
        TradeStatus status;
        uint256 createdAt;
        uint256 executedAt;
        uint256 actualPrice;        // Actual execution price
        uint8 riskScore;            // Risk score from audit
        bool isSimulation;          // True for simulation mode
        string rejectionReason;
    }
    
    /**
     * @notice Trade execution result
     */
    struct TradeResult {
        uint256 orderId;
        bool success;
        uint256 executedAmount;
        uint256 executedPrice;
        uint256 totalCost;
        uint256 gasUsed;
        string message;
    }
    
    /**
     * @notice Risk threshold configuration
     */
    struct RiskThreshold {
        uint8 minSafeScore;         // Minimum score to approve (0-100)
        uint8 warningScore;         // Score that triggers warning (0-100)
        bool requireAudit;          // Require audit before trading
        uint256 minAudits;          // Minimum number of audits required
        uint256 maxTradeAmount;     // Max amount per trade
    }
    
    // State variables
    mapping(uint256 => TradeOrder) public tradeOrders;
    mapping(address => uint256[]) public traderOrders;
    mapping(address => uint256[]) public tokenTrades;
    mapping(address => uint256) public traderVolume;
    mapping(address => uint256) public traderProfit;
    
    uint256 public orderCounter;
    RiskThreshold public riskThreshold;
    IAuditRegistry public auditRegistry;
    
    bool public tradingEnabled = true;
    bool public simulationMode = true; // Default to simulation
    uint256 public totalTradesExecuted;
    uint256 public totalTradesRejected;
    uint256 public totalVolume;
    
    // Events
    event TradeOrderCreated(
        uint256 indexed orderId,
        address indexed trader,
        address indexed tokenAddress,
        TradeDirection direction,
        uint256 amount
    );
    
    event TradeApproved(
        uint256 indexed orderId,
        uint8 riskScore
    );
    
    event TradeRejected(
        uint256 indexed orderId,
        string reason,
        uint8 riskScore
    );
    
    event TradeExecuted(
        uint256 indexed orderId,
        address indexed trader,
        address indexed tokenAddress,
        uint256 amount,
        uint256 price,
        bool isSimulation
    );
    
    event TradeFailed(
        uint256 indexed orderId,
        string reason
    );
    
    event TradeCancelled(
        uint256 indexed orderId,
        address indexed canceller
    );
    
    event RiskThresholdUpdated(
        uint8 minSafeScore,
        uint8 warningScore,
        uint256 maxTradeAmount
    );
    
    event AuditRegistryUpdated(address indexed newRegistry);
    event SimulationModeToggled(bool enabled);
    event TradingToggled(bool enabled);
    event EmergencyWithdrawal(address indexed token, uint256 amount);
    
    /**
     * @notice Contract constructor
     * @param _auditRegistry Address of AuditRegistry contract
     */
    constructor(address _auditRegistry) {
        require(_auditRegistry != address(0), "Invalid audit registry");
        
        auditRegistry = IAuditRegistry(_auditRegistry);
        
        // Set default risk thresholds
        riskThreshold = RiskThreshold({
            minSafeScore: 60,        // 60/100 minimum score
            warningScore: 75,        // 75/100 warning threshold
            requireAudit: true,
            minAudits: 3,
            maxTradeAmount: 100 ether
        });
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TRADER_ROLE, msg.sender);
        _grantRole(RISK_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @notice Create a new trade order
     * @dev Automatically checks risk score before creating order
     * @param _tokenAddress Token to trade
     * @param _direction Buy or Sell
     * @param _amount Amount of tokens
     * @param _expectedPrice Expected price per token
     * @param _slippage Max slippage in basis points
     * @param _deadline Execution deadline
     * @return orderId The ID of the created trade order
     */
    function createTradeOrder(
        address _tokenAddress,
        TradeDirection _direction,
        uint256 _amount,
        uint256 _expectedPrice,
        uint256 _slippage,
        uint256 _deadline
    ) external onlyRole(TRADER_ROLE) nonReentrant returns (uint256) {
        require(tradingEnabled, "Trading is disabled");
        require(_tokenAddress != address(0), "Invalid token");
        require(_amount > 0, "Amount must be positive");
        require(_amount <= riskThreshold.maxTradeAmount, "Amount exceeds limit");
        require(_expectedPrice > 0, "Invalid price");
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_slippage <= 1000, "Slippage too high"); // Max 10%
        
        orderCounter++;
        uint256 orderId = orderCounter;
        
        TradeOrder storage order = tradeOrders[orderId];
        order.orderId = orderId;
        order.trader = msg.sender;
        order.tokenAddress = _tokenAddress;
        order.direction = _direction;
        order.amount = _amount;
        order.expectedPrice = _expectedPrice;
        order.slippage = _slippage;
        order.deadline = _deadline;
        order.status = TradeStatus.Pending;
        order.createdAt = block.timestamp;
        order.isSimulation = simulationMode;
        
        // Update mappings
        traderOrders[msg.sender].push(orderId);
        tokenTrades[_tokenAddress].push(orderId);
        
        emit TradeOrderCreated(orderId, msg.sender, _tokenAddress, _direction, _amount);
        
        // Automatically perform risk check
        _performRiskCheck(orderId);
        
        return orderId;
    }
    
    /**
     * @notice Perform risk assessment on a trade order
     * @dev Checks audit registry for token safety
     * @param _orderId Order ID to check
     */
    function _performRiskCheck(uint256 _orderId) internal {
        TradeOrder storage order = tradeOrders[_orderId];
        require(order.orderId != 0, "Order does not exist");
        require(order.status == TradeStatus.Pending, "Order not pending");
        
        // Check audit registry
        (bool isSafe, uint8 riskScore) = auditRegistry.isTokenSafe(order.tokenAddress);
        order.riskScore = riskScore;
        
        // Evaluate based on risk threshold
        if (!isSafe) {
            order.status = TradeStatus.Rejected;
            order.rejectionReason = "Token failed safety check";
            totalTradesRejected++;
            emit TradeRejected(_orderId, order.rejectionReason, riskScore);
            return;
        }
        
        if (riskScore < riskThreshold.minSafeScore) {
            order.status = TradeStatus.Rejected;
            order.rejectionReason = "Risk score below threshold";
            totalTradesRejected++;
            emit TradeRejected(_orderId, order.rejectionReason, riskScore);
            return;
        }
        
        // Approve trade
        order.status = TradeStatus.Approved;
        emit TradeApproved(_orderId, riskScore);
    }
    
    /**
     * @notice Execute an approved trade order
     * @dev Can be called by trader or automatically
     * @param _orderId Order ID to execute
     * @return result Trade execution result
     */
    function executeTrade(uint256 _orderId) 
        external 
        onlyRole(TRADER_ROLE) 
        nonReentrant 
        returns (TradeResult memory result) 
    {
        TradeOrder storage order = tradeOrders[_orderId];
        require(order.orderId != 0, "Order does not exist");
        require(order.status == TradeStatus.Approved, "Order not approved");
        require(block.timestamp <= order.deadline, "Order expired");
        require(tradingEnabled, "Trading is disabled");
        
        uint256 gasStart = gasleft();
        
        if (order.isSimulation) {
            // Simulate trade execution
            result = _simulateTrade(order);
        } else {
            // Execute real trade (would integrate with DEX here)
            result = _executeRealTrade(order);
        }
        
        uint256 gasUsed = gasStart - gasleft();
        result.gasUsed = gasUsed;
        
        if (result.success) {
            order.status = TradeStatus.Executed;
            order.executedAt = block.timestamp;
            order.actualPrice = result.executedPrice;
            
            // Update statistics
            totalTradesExecuted++;
            totalVolume += result.totalCost;
            traderVolume[order.trader] += result.totalCost;
            
            emit TradeExecuted(
                _orderId,
                order.trader,
                order.tokenAddress,
                result.executedAmount,
                result.executedPrice,
                order.isSimulation
            );
        } else {
            order.status = TradeStatus.Failed;
            emit TradeFailed(_orderId, result.message);
        }
        
        return result;
    }
    
    /**
     * @notice Simulate trade execution
     * @dev Returns simulated results without actual token transfers
     * @param order Trade order to simulate
     * @return result Simulation result
     */
    function _simulateTrade(TradeOrder storage order) 
        internal 
        view 
        returns (TradeResult memory result) 
    {
        result.orderId = order.orderId;
        result.success = true;
        result.executedAmount = order.amount;
        result.executedPrice = order.expectedPrice;
        result.totalCost = order.amount * order.expectedPrice / 1e18;
        result.message = "Trade simulated successfully";
        
        return result;
    }
    
    /**
     * @notice Execute real trade
     * @dev Placeholder for actual DEX integration
     * @param order Trade order to execute
     * @return result Execution result
     */
    function _executeRealTrade(TradeOrder storage order) 
        internal 
        returns (TradeResult memory result) 
    {
        // In production, this would integrate with Uniswap, Sushiswap, etc.
        // For now, return success with expected values
        
        result.orderId = order.orderId;
        result.success = true;
        result.executedAmount = order.amount;
        result.executedPrice = order.expectedPrice;
        result.totalCost = order.amount * order.expectedPrice / 1e18;
        result.message = "Trade executed (integration pending)";
        
        // TODO: Integrate with DEX router
        // - Check allowances
        // - Execute swap
        // - Handle slippage
        // - Update balances
        
        return result;
    }
    
    /**
     * @notice Batch execute multiple approved trades
     * @dev Executes multiple orders in one transaction
     * @param _orderIds Array of order IDs
     * @return results Array of execution results
     */
    function batchExecuteTrades(uint256[] memory _orderIds) 
        external 
        onlyRole(TRADER_ROLE) 
        returns (TradeResult[] memory results) 
    {
        results = new TradeResult[](_orderIds.length);
        
        for (uint256 i = 0; i < _orderIds.length; i++) {
            TradeOrder storage order = tradeOrders[_orderIds[i]];
            if (order.status == TradeStatus.Approved && block.timestamp <= order.deadline) {
                results[i] = this.executeTrade(_orderIds[i]);
            }
        }
        
        return results;
    }
    
    /**
     * @notice Cancel a pending or approved trade
     * @dev Only trader or admin can cancel
     * @param _orderId Order ID to cancel
     */
    function cancelTrade(uint256 _orderId) external {
        TradeOrder storage order = tradeOrders[_orderId];
        require(order.orderId != 0, "Order does not exist");
        require(
            msg.sender == order.trader || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        require(
            order.status == TradeStatus.Pending || order.status == TradeStatus.Approved,
            "Cannot cancel"
        );
        
        order.status = TradeStatus.Cancelled;
        
        emit TradeCancelled(_orderId, msg.sender);
    }
    
    /**
     * @notice Manually approve a trade (risk manager override)
     * @dev Only risk manager can manually approve
     * @param _orderId Order ID to approve
     */
    function manuallyApproveTrade(uint256 _orderId) 
        external 
        onlyRole(RISK_MANAGER_ROLE) 
    {
        TradeOrder storage order = tradeOrders[_orderId];
        require(order.orderId != 0, "Order does not exist");
        require(order.status == TradeStatus.Pending || order.status == TradeStatus.Rejected, "Invalid status");
        
        order.status = TradeStatus.Approved;
        emit TradeApproved(_orderId, order.riskScore);
    }
    
    /**
     * @notice Update risk thresholds
     * @dev Only risk manager can update
     * @param _minSafeScore New minimum safe score
     * @param _warningScore New warning score
     * @param _maxTradeAmount New max trade amount
     */
    function updateRiskThreshold(
        uint8 _minSafeScore,
        uint8 _warningScore,
        uint256 _maxTradeAmount
    ) external onlyRole(RISK_MANAGER_ROLE) {
        require(_minSafeScore <= 100, "Invalid min score");
        require(_warningScore <= 100, "Invalid warning score");
        require(_warningScore >= _minSafeScore, "Warning must be >= min");
        require(_maxTradeAmount > 0, "Invalid max amount");
        
        riskThreshold.minSafeScore = _minSafeScore;
        riskThreshold.warningScore = _warningScore;
        riskThreshold.maxTradeAmount = _maxTradeAmount;
        
        emit RiskThresholdUpdated(_minSafeScore, _warningScore, _maxTradeAmount);
    }
    
    /**
     * @notice Update audit registry address
     * @dev Only admin can update
     * @param _newRegistry New audit registry address
     */
    function updateAuditRegistry(address _newRegistry) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_newRegistry != address(0), "Invalid address");
        auditRegistry = IAuditRegistry(_newRegistry);
        emit AuditRegistryUpdated(_newRegistry);
    }
    
    /**
     * @notice Toggle simulation mode
     * @dev Only admin can toggle
     * @param _enabled True to enable simulation mode
     */
    function toggleSimulationMode(bool _enabled) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        simulationMode = _enabled;
        emit SimulationModeToggled(_enabled);
    }
    
    /**
     * @notice Toggle trading
     * @dev Only admin can toggle - emergency stop
     * @param _enabled True to enable trading
     */
    function toggleTrading(bool _enabled) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        tradingEnabled = _enabled;
        emit TradingToggled(_enabled);
    }
    
    /**
     * @notice Get trade order details
     * @param _orderId Order ID
     * @return Complete trade order
     */
    function getTradeOrder(uint256 _orderId) 
        external 
        view 
        returns (TradeOrder memory) 
    {
        require(tradeOrders[_orderId].orderId != 0, "Order does not exist");
        return tradeOrders[_orderId];
    }
    
    /**
     * @notice Get all orders for a trader
     * @param _trader Trader address
     * @return Array of order IDs
     */
    function getTraderOrders(address _trader) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return traderOrders[_trader];
    }
    
    /**
     * @notice Get all trades for a token
     * @param _token Token address
     * @return Array of order IDs
     */
    function getTokenTrades(address _token) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return tokenTrades[_token];
    }
    
    /**
     * @notice Get trader statistics
     * @param _trader Trader address
     * @return volume Total trading volume
     * @return profit Total profit (if tracking)
     * @return orderCount Number of orders
     */
    function getTraderStats(address _trader) 
        external 
        view 
        returns (uint256 volume, uint256 profit, uint256 orderCount) 
    {
        return (
            traderVolume[_trader],
            traderProfit[_trader],
            traderOrders[_trader].length
        );
    }
    
    /**
     * @notice Get platform statistics
     * @return executed Total trades executed
     * @return rejected Total trades rejected
     * @return volume Total trading volume
     * @return ordersCount Total orders created
     */
    function getPlatformStats() 
        external 
        view 
        returns (
            uint256 executed,
            uint256 rejected,
            uint256 volume,
            uint256 ordersCount
        ) 
    {
        return (
            totalTradesExecuted,
            totalTradesRejected,
            totalVolume,
            orderCounter
        );
    }
    
    /**
     * @notice Emergency withdrawal of tokens
     * @dev Only admin - for emergency situations
     * @param _token Token address (address(0) for ETH)
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(address _token, uint256 _amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (_token == address(0)) {
            payable(msg.sender).transfer(_amount);
        } else {
            IERC20(_token).safeTransfer(msg.sender, _amount);
        }
        emit EmergencyWithdrawal(_token, _amount);
    }
    
    // Receive ETH
    receive() external payable {}
}

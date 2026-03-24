// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentMarketplace
 * @dev Marketplace for AI agents to register and be discovered by trader agents
 */
contract AgentMarketplace is Ownable, ReentrancyGuard {
    
    enum AgentType { Security, Liquidity, Tokenomics, General }
    
    struct Agent {
        address agentAddress;
        string name;
        string endpoint;
        AgentType agentType;
        uint256 pricePerVerification;
        uint256 reputationScore;
        uint256 totalJobs;
        uint256 successfulJobs;
        bool isActive;
        uint256 registeredAt;
    }
    
    struct JobListing {
        uint256 jobId;
        address client;
        AgentType requiredType;
        uint256 budget;
        address selectedAgent;
        bool isCompleted;
        uint256 createdAt;
    }
    
    // State variables
    mapping(address => Agent) public agents;
    address[] public agentList;
    mapping(uint256 => JobListing) public jobs;
    uint256 public jobCounter;
    uint256 public platformFee = 250; // 2.5% fee (in basis points)
    
    // Events
    event AgentRegistered(address indexed agentAddress, string name, AgentType agentType);
    event AgentUpdated(address indexed agentAddress, uint256 newPrice);
    event AgentDeactivated(address indexed agentAddress);
    event JobCreated(uint256 indexed jobId, address indexed client, AgentType requiredType, uint256 budget);
    event AgentHired(uint256 indexed jobId, address indexed agent);
    event JobCompleted(uint256 indexed jobId, bool success);
    event ReputationUpdated(address indexed agent, uint256 newScore);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a new agent in the marketplace
     */
    function registerAgent(
        string memory _name,
        string memory _endpoint,
        AgentType _agentType,
        uint256 _pricePerVerification
    ) external {
        require(agents[msg.sender].agentAddress == address(0), "Agent already registered");
        require(_pricePerVerification > 0, "Price must be greater than 0");
        
        agents[msg.sender] = Agent({
            agentAddress: msg.sender,
            name: _name,
            endpoint: _endpoint,
            agentType: _agentType,
            pricePerVerification: _pricePerVerification,
            reputationScore: 5000, // Start at 50.00 score
            totalJobs: 0,
            successfulJobs: 0,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        agentList.push(msg.sender);
        
        emit AgentRegistered(msg.sender, _name, _agentType);
    }
    
    /**
     * @dev Update agent's pricing
     */
    function updateAgentPrice(uint256 _newPrice) external {
        require(agents[msg.sender].agentAddress != address(0), "Agent not registered");
        require(_newPrice > 0, "Price must be greater than 0");
        
        agents[msg.sender].pricePerVerification = _newPrice;
        emit AgentUpdated(msg.sender, _newPrice);
    }
    
    /**
     * @dev Deactivate an agent
     */
    function deactivateAgent() external {
        require(agents[msg.sender].agentAddress != address(0), "Agent not registered");
        agents[msg.sender].isActive = false;
        emit AgentDeactivated(msg.sender);
    }
    
    /**
     * @dev Create a new job listing
     */
    function createJob(AgentType _requiredType) external payable returns (uint256) {
        require(msg.value > 0, "Must send payment");
        
        jobCounter++;
        jobs[jobCounter] = JobListing({
            jobId: jobCounter,
            client: msg.sender,
            requiredType: _requiredType,
            budget: msg.value,
            selectedAgent: address(0),
            isCompleted: false,
            createdAt: block.timestamp
        });
        
        emit JobCreated(jobCounter, msg.sender, _requiredType, msg.value);
        return jobCounter;
    }
    
    /**
     * @dev Get all active agents of a specific type
     */
    function getAgentsByType(AgentType _agentType) external view returns (address[] memory) {
        uint256 count = 0;
        
        // Count matching agents
        for (uint256 i = 0; i < agentList.length; i++) {
            if (agents[agentList[i]].agentType == _agentType && agents[agentList[i]].isActive) {
                count++;
            }
        }
        
        // Build result array
        address[] memory result = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < agentList.length; i++) {
            if (agents[agentList[i]].agentType == _agentType && agents[agentList[i]].isActive) {
                result[index] = agentList[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get top agents by reputation
     */
    function getTopAgents(uint256 _limit) external view returns (address[] memory) {
        uint256 length = agentList.length < _limit ? agentList.length : _limit;
        address[] memory topAgents = new address[](length);
        
        // Simple selection (in production, use more sophisticated sorting)
        uint256 added = 0;
        for (uint256 i = 0; i < agentList.length && added < length; i++) {
            if (agents[agentList[i]].isActive) {
                topAgents[added] = agentList[i];
                added++;
            }
        }
        
        return topAgents;
    }
    
    /**
     * @dev Update agent reputation after job completion
     */
    function updateReputation(address _agent, bool _success) external {
        require(agents[_agent].agentAddress != address(0), "Agent not found");
        
        Agent storage agent = agents[_agent];
        agent.totalJobs++;
        
        if (_success) {
            agent.successfulJobs++;
            // Increase reputation (max 10000 = 100.00)
            if (agent.reputationScore < 9500) {
                agent.reputationScore += 100;
            }
        } else {
            // Decrease reputation (min 0)
            if (agent.reputationScore > 200) {
                agent.reputationScore -= 200;
            }
        }
        
        emit ReputationUpdated(_agent, agent.reputationScore);
    }
    
    /**
     * @dev Get agent details
     */
    function getAgent(address _agentAddress) external view returns (Agent memory) {
        return agents[_agentAddress];
    }
    
    /**
     * @dev Get total number of registered agents
     */
    function getTotalAgents() external view returns (uint256) {
        return agentList.length;
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
    }
    
    /**
     * @dev Withdraw accumulated platform fees
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationRegistry
 * @dev Tracks and manages reputation scores for agents
 */
contract ReputationRegistry is Ownable {
    
    struct ReputationData {
        uint256 score; // Score out of 10000 (100.00)
        uint256 totalJobs;
        uint256 successfulJobs;
        uint256 failedJobs;
        uint256 totalEarnings;
        uint256 averageResponseTime;
        uint256 lastUpdated;
        bool isVerified;
    }
    
    struct Review {
        address reviewer;
        address agent;
        uint256 jobId;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
    }
    
    // State variables
    mapping(address => ReputationData) public reputations;
    mapping(address => Review[]) public agentReviews;
    mapping(address => bool) public authorizedUpdaters;
    
    uint256 public constant INITIAL_SCORE = 5000; // 50.00
    uint256 public constant MAX_SCORE = 10000; // 100.00
    uint256 public constant MIN_SCORE = 0;
    
    // Events
    event ReputationInitialized(address indexed agent, uint256 initialScore);
    event ReputationUpdated(address indexed agent, uint256 newScore, uint256 totalJobs);
    event ReviewAdded(address indexed agent, address indexed reviewer, uint8 rating);
    event AgentVerified(address indexed agent);
    event UpdaterAuthorized(address indexed updater);
    event UpdaterRevoked(address indexed updater);
    
    constructor() Ownable(msg.sender) {
        authorizedUpdaters[msg.sender] = true;
    }
    
    /**
     * @dev Initialize reputation for a new agent
     */
    function initializeReputation(address _agent) external {
        require(authorizedUpdaters[msg.sender], "Not authorized");
        require(reputations[_agent].lastUpdated == 0, "Already initialized");
        
        reputations[_agent] = ReputationData({
            score: INITIAL_SCORE,
            totalJobs: 0,
            successfulJobs: 0,
            failedJobs: 0,
            totalEarnings: 0,
            averageResponseTime: 0,
            lastUpdated: block.timestamp,
            isVerified: false
        });
        
        emit ReputationInitialized(_agent, INITIAL_SCORE);
    }
    
    /**
     * @dev Update reputation after job completion
     */
    function updateReputation(
        address _agent,
        bool _success,
        uint256 _earnings,
        uint256 _responseTime
    ) external {
        require(authorizedUpdaters[msg.sender], "Not authorized");
        
        ReputationData storage rep = reputations[_agent];
        
        // Initialize if not exists
        if (rep.lastUpdated == 0) {
            rep.score = INITIAL_SCORE;
        }
        
        rep.totalJobs++;
        rep.totalEarnings += _earnings;
        
        // Update average response time
        if (rep.averageResponseTime == 0) {
            rep.averageResponseTime = _responseTime;
        } else {
            rep.averageResponseTime = (rep.averageResponseTime + _responseTime) / 2;
        }
        
        if (_success) {
            rep.successfulJobs++;
            // Increase score for success
            uint256 increment = 50; // Base increment
            
            // Bonus for consistent success
            if (rep.totalJobs > 10 && rep.successfulJobs * 100 / rep.totalJobs > 90) {
                increment = 100;
            }
            
            if (rep.score + increment <= MAX_SCORE) {
                rep.score += increment;
            } else {
                rep.score = MAX_SCORE;
            }
        } else {
            rep.failedJobs++;
            // Decrease score for failure
            uint256 decrement = 150;
            
            if (rep.score >= decrement) {
                rep.score -= decrement;
            } else {
                rep.score = MIN_SCORE;
            }
        }
        
        rep.lastUpdated = block.timestamp;
        
        emit ReputationUpdated(_agent, rep.score, rep.totalJobs);
    }
    
    /**
     * @dev Add a review for an agent
     */
    function addReview(
        address _agent,
        uint256 _jobId,
        uint8 _rating,
        string memory _comment
    ) external {
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        require(bytes(_comment).length <= 500, "Comment too long");
        
        Review memory newReview = Review({
            reviewer: msg.sender,
            agent: _agent,
            jobId: _jobId,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp
        });
        
        agentReviews[_agent].push(newReview);
        
        emit ReviewAdded(_agent, msg.sender, _rating);
    }
    
    /**
     * @dev Verify an agent (manual verification by owner)
     */
    function verifyAgent(address _agent) external onlyOwner {
        reputations[_agent].isVerified = true;
        emit AgentVerified(_agent);
    }
    
    /**
     * @dev Get agent's reputation data
     */
    function getReputation(address _agent) external view returns (ReputationData memory) {
        return reputations[_agent];
    }
    
    /**
     * @dev Get agent's success rate (percentage * 100)
     */
    function getSuccessRate(address _agent) external view returns (uint256) {
        ReputationData memory rep = reputations[_agent];
        if (rep.totalJobs == 0) return 0;
        return (rep.successfulJobs * 10000) / rep.totalJobs;
    }
    
    /**
     * @dev Get reviews for an agent
     */
    function getReviews(address _agent) external view returns (Review[] memory) {
        return agentReviews[_agent];
    }
    
    /**
     * @dev Get average rating for an agent
     */
    function getAverageRating(address _agent) external view returns (uint256) {
        Review[] memory reviews = agentReviews[_agent];
        if (reviews.length == 0) return 0;
        
        uint256 totalRating = 0;
        for (uint256 i = 0; i < reviews.length; i++) {
            totalRating += reviews[i].rating;
        }
        
        return (totalRating * 100) / reviews.length; // Returns rating * 100
    }
    
    /**
     * @dev Authorize an address to update reputations
     */
    function authorizeUpdater(address _updater) external onlyOwner {
        authorizedUpdaters[_updater] = true;
        emit UpdaterAuthorized(_updater);
    }
    
    /**
     * @dev Revoke updater authorization
     */
    function revokeUpdater(address _updater) external onlyOwner {
        authorizedUpdaters[_updater] = false;
        emit UpdaterRevoked(_updater);
    }
    
    /**
     * @dev Check if address is authorized updater
     */
    function isAuthorizedUpdater(address _updater) external view returns (bool) {
        return authorizedUpdaters[_updater];
    }
}

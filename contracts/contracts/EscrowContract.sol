// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EscrowContract
 * @dev Manages escrow for agent verification jobs
 */
contract EscrowContract is Ownable, ReentrancyGuard {
    
    enum JobStatus { Created, AgentsHired, InProgress, Completed, Disputed, Cancelled }
    
    struct Job {
        uint256 jobId;
        address client;
        address tokenAddress;
        address[] hiredAgents;
        mapping(address => uint256) agentPayments;
        mapping(address => bool) agentCompleted;
        mapping(address => bytes32) agentReports;
        uint256 totalBudget;
        uint256 remainingBudget;
        JobStatus status;
        uint256 deadline;
        uint256 createdAt;
        uint256 completedAgents;
    }
    
    // State variables
    mapping(uint256 => Job) public jobs;
    uint256 public jobCounter;
    uint256 public platformFee = 250; // 2.5% in basis points
    address public platformWallet;
    
    // Events
    event JobCreated(uint256 indexed jobId, address indexed client, address tokenAddress, uint256 budget);
    event AgentHired(uint256 indexed jobId, address indexed agent, uint256 payment);
    event ReportSubmitted(uint256 indexed jobId, address indexed agent, bytes32 reportHash);
    event PaymentReleased(uint256 indexed jobId, address indexed agent, uint256 amount);
    event JobCompleted(uint256 indexed jobId);
    event JobCancelled(uint256 indexed jobId);
    event DisputeRaised(uint256 indexed jobId, address indexed raiser);
    
    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }
    
    /**
     * @dev Create a new escrow job
     */
    function createJob(
        address _tokenAddress,
        address[] memory _agents,
        uint256[] memory _payments,
        uint256 _deadline
    ) external payable returns (uint256) {
        require(_agents.length > 0, "Must hire at least one agent");
        require(_agents.length == _payments.length, "Arrays length mismatch");
        require(_deadline > block.timestamp, "Deadline must be in future");
        
        uint256 totalPayment = 0;
        for (uint256 i = 0; i < _payments.length; i++) {
            totalPayment += _payments[i];
        }
        
        uint256 feeAmount = (totalPayment * platformFee) / 10000;
        require(msg.value >= totalPayment + feeAmount, "Insufficient payment");
        
        jobCounter++;
        Job storage newJob = jobs[jobCounter];
        newJob.jobId = jobCounter;
        newJob.client = msg.sender;
        newJob.tokenAddress = _tokenAddress;
        newJob.hiredAgents = _agents;
        newJob.totalBudget = totalPayment;
        newJob.remainingBudget = totalPayment;
        newJob.status = JobStatus.AgentsHired;
        newJob.deadline = _deadline;
        newJob.createdAt = block.timestamp;
        newJob.completedAgents = 0;
        
        for (uint256 i = 0; i < _agents.length; i++) {
            newJob.agentPayments[_agents[i]] = _payments[i];
        }
        
        // Transfer platform fee
        if (feeAmount > 0) {
            payable(platformWallet).transfer(feeAmount);
        }
        
        emit JobCreated(jobCounter, msg.sender, _tokenAddress, totalPayment);
        
        for (uint256 i = 0; i < _agents.length; i++) {
            emit AgentHired(jobCounter, _agents[i], _payments[i]);
        }
        
        return jobCounter;
    }
    
    /**
     * @dev Agent submits their verification report
     */
    function submitReport(uint256 _jobId, bytes32 _reportHash) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.AgentsHired || job.status == JobStatus.InProgress, "Invalid job status");
        require(job.agentPayments[msg.sender] > 0, "Not hired for this job");
        require(!job.agentCompleted[msg.sender], "Report already submitted");
        require(block.timestamp <= job.deadline, "Job deadline passed");
        
        job.agentCompleted[msg.sender] = true;
        job.agentReports[msg.sender] = _reportHash;
        job.completedAgents++;
        
        if (job.status == JobStatus.AgentsHired) {
            job.status = JobStatus.InProgress;
        }
        
        emit ReportSubmitted(_jobId, msg.sender, _reportHash);
        
        // Auto-release payment to agent
        _releasePayment(_jobId, msg.sender);
        
        // Check if all agents completed
        if (job.completedAgents == job.hiredAgents.length) {
            job.status = JobStatus.Completed;
            emit JobCompleted(_jobId);
        }
    }
    
    /**
     * @dev Internal function to release payment to agent
     */
    function _releasePayment(uint256 _jobId, address _agent) internal nonReentrant {
        Job storage job = jobs[_jobId];
        uint256 payment = job.agentPayments[_agent];
        
        require(payment > 0, "No payment for agent");
        require(job.remainingBudget >= payment, "Insufficient budget");
        
        job.remainingBudget -= payment;
        job.agentPayments[_agent] = 0;
        
        payable(_agent).transfer(payment);
        emit PaymentReleased(_jobId, _agent, payment);
    }
    
    /**
     * @dev Client can cancel job before agents start work
     */
    function cancelJob(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client can cancel");
        require(job.status == JobStatus.AgentsHired, "Cannot cancel at this stage");
        require(job.completedAgents == 0, "Agents already working");
        
        job.status = JobStatus.Cancelled;
        
        // Refund remaining budget to client
        uint256 refund = job.remainingBudget;
        job.remainingBudget = 0;
        
        payable(job.client).transfer(refund);
        emit JobCancelled(_jobId);
    }
    
    /**
     * @dev Raise a dispute
     */
    function raiseDispute(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client || job.agentPayments[msg.sender] > 0, "Not authorized");
        require(job.status == JobStatus.InProgress, "Invalid status for dispute");
        
        job.status = JobStatus.Disputed;
        emit DisputeRaised(_jobId, msg.sender);
    }
    
    /**
     * @dev Get job details
     */
    function getJob(uint256 _jobId) external view returns (
        address client,
        address tokenAddress,
        address[] memory hiredAgents,
        uint256 totalBudget,
        uint256 remainingBudget,
        JobStatus status,
        uint256 deadline,
        uint256 completedAgents
    ) {
        Job storage job = jobs[_jobId];
        return (
            job.client,
            job.tokenAddress,
            job.hiredAgents,
            job.totalBudget,
            job.remainingBudget,
            job.status,
            job.deadline,
            job.completedAgents
        );
    }
    
    /**
     * @dev Get agent's report hash for a job
     */
    function getAgentReport(uint256 _jobId, address _agent) external view returns (bytes32) {
        return jobs[_jobId].agentReports[_agent];
    }
    
    /**
     * @dev Check if agent has completed their work
     */
    function hasAgentCompleted(uint256 _jobId, address _agent) external view returns (bool) {
        return jobs[_jobId].agentCompleted[_agent];
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
    }
    
    /**
     * @dev Update platform wallet
     */
    function updatePlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid address");
        platformWallet = _newWallet;
    }
    
    /**
     * @dev Emergency withdraw (only owner, for stuck funds)
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        payable(owner()).transfer(address(this).balance);
    }
}

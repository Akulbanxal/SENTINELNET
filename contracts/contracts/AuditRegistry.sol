// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AuditRegistry
 * @dev Stores and manages verification reports submitted by agents
 * @notice This contract maintains a registry of all audit reports with detailed risk scores
 */
contract AuditRegistry is AccessControl, ReentrancyGuard {
    
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    /// @notice Risk categories for comprehensive token analysis
    enum RiskCategory { Security, Liquidity, Tokenomics, Market, Technical }
    
    /// @notice Overall risk assessment levels
    enum RiskLevel { VeryLow, Low, Medium, High, Critical }
    
    /**
     * @notice Detailed risk scores for different aspects of token analysis
     * @dev Scores are out of 100 (0 = highest risk, 100 = lowest risk)
     */
    struct RiskScores {
        uint8 securityScore;      // Smart contract security (0-100)
        uint8 liquidityScore;     // Liquidity and trading volume (0-100)
        uint8 tokenomicsScore;    // Token distribution and economics (0-100)
        uint8 marketScore;        // Market manipulation risk (0-100)
        uint8 technicalScore;     // Technical implementation quality (0-100)
        uint8 overallScore;       // Weighted average of all scores (0-100)
        RiskLevel riskLevel;      // Categorical risk assessment
    }
    
    /**
     * @notice Detailed findings from agent analysis
     * @dev Stores specific vulnerabilities or concerns identified
     */
    struct AuditFindings {
        string[] criticalIssues;   // Critical vulnerabilities found
        string[] warnings;          // Warning-level issues
        string[] recommendations;   // Improvement suggestions
        string methodology;         // Analysis methodology used
        uint256 analysisDepth;     // Depth of analysis (1-5)
    }
    
    /**
     * @notice Complete audit report structure
     * @dev Comprehensive report submitted by verification agents
     */
    struct AuditReport {
        uint256 reportId;
        uint256 jobId;
        address tokenAddress;
        address auditor;
        RiskScores riskScores;
        AuditFindings findings;
        string ipfsHash;           // IPFS hash for detailed report
        uint256 timestamp;
        bool isFinalized;
        bool disputed;
    }
    
    /**
     * @notice Aggregated risk data for a token across all audits
     */
    struct TokenRiskProfile {
        address tokenAddress;
        uint256 totalAudits;
        uint256 lastAuditTimestamp;
        uint8 averageSecurityScore;
        uint8 averageLiquidityScore;
        uint8 averageTokenomicsScore;
        uint8 overallRiskScore;
        RiskLevel consensusRiskLevel;
        bool isBlacklisted;
    }
    
    // State variables
    mapping(uint256 => AuditReport) public auditReports;
    mapping(address => TokenRiskProfile) public tokenProfiles;
    mapping(address => uint256[]) public auditorReports;
    mapping(address => uint256[]) public tokenAudits;
    mapping(uint256 => uint256[]) public jobReports;
    
    uint256 public reportCounter;
    uint256 public constant MIN_SCORE_THRESHOLD = 60; // Minimum acceptable score
    uint256 public constant CONSENSUS_THRESHOLD = 3;   // Min audits for consensus
    
    // Events
    event AuditReportSubmitted(
        uint256 indexed reportId,
        uint256 indexed jobId,
        address indexed tokenAddress,
        address auditor,
        uint8 overallScore
    );
    
    event ReportFinalized(
        uint256 indexed reportId,
        address indexed tokenAddress,
        RiskLevel riskLevel
    );
    
    event ReportDisputed(
        uint256 indexed reportId,
        address indexed disputer,
        string reason
    );
    
    event TokenProfileUpdated(
        address indexed tokenAddress,
        uint8 overallRiskScore,
        RiskLevel consensusRiskLevel
    );
    
    event TokenBlacklisted(
        address indexed tokenAddress,
        string reason
    );
    
    event TokenWhitelisted(
        address indexed tokenAddress
    );
    
    event AgentRoleGranted(address indexed agent);
    event AuditorRoleGranted(address indexed auditor);
    
    /**
     * @notice Contract constructor
     * @dev Grants DEFAULT_ADMIN_ROLE to deployer
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }
    
    /**
     * @notice Submit a new audit report
     * @dev Only authorized agents can submit reports
     * @param _jobId Associated job ID
     * @param _tokenAddress Token being audited
     * @param _riskScores Detailed risk scores
     * @param _findings Audit findings and recommendations
     * @param _ipfsHash IPFS hash for detailed report
     * @return reportId The ID of the created report
     */
    function submitAuditReport(
        uint256 _jobId,
        address _tokenAddress,
        RiskScores memory _riskScores,
        AuditFindings memory _findings,
        string memory _ipfsHash
    ) external onlyRole(AGENT_ROLE) nonReentrant returns (uint256) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_riskScores.overallScore <= 100, "Invalid overall score");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        reportCounter++;
        uint256 reportId = reportCounter;
        
        AuditReport storage report = auditReports[reportId];
        report.reportId = reportId;
        report.jobId = _jobId;
        report.tokenAddress = _tokenAddress;
        report.auditor = msg.sender;
        report.riskScores = _riskScores;
        report.findings = _findings;
        report.ipfsHash = _ipfsHash;
        report.timestamp = block.timestamp;
        report.isFinalized = false;
        report.disputed = false;
        
        // Update mappings
        auditorReports[msg.sender].push(reportId);
        tokenAudits[_tokenAddress].push(reportId);
        jobReports[_jobId].push(reportId);
        
        emit AuditReportSubmitted(
            reportId,
            _jobId,
            _tokenAddress,
            msg.sender,
            _riskScores.overallScore
        );
        
        return reportId;
    }
    
    /**
     * @notice Finalize an audit report
     * @dev Can only be finalized once
     * @param _reportId Report to finalize
     */
    function finalizeReport(uint256 _reportId) external onlyRole(AUDITOR_ROLE) {
        AuditReport storage report = auditReports[_reportId];
        require(report.reportId != 0, "Report does not exist");
        require(!report.isFinalized, "Report already finalized");
        require(!report.disputed, "Cannot finalize disputed report");
        
        report.isFinalized = true;
        
        // Update token profile
        _updateTokenProfile(report.tokenAddress);
        
        emit ReportFinalized(
            _reportId,
            report.tokenAddress,
            report.riskScores.riskLevel
        );
    }
    
    /**
     * @notice Dispute an audit report
     * @dev Can be disputed by auditors if findings are questionable
     * @param _reportId Report to dispute
     * @param _reason Reason for dispute
     */
    function disputeReport(
        uint256 _reportId,
        string memory _reason
    ) external onlyRole(AUDITOR_ROLE) {
        AuditReport storage report = auditReports[_reportId];
        require(report.reportId != 0, "Report does not exist");
        require(!report.isFinalized, "Cannot dispute finalized report");
        require(bytes(_reason).length > 0, "Reason required");
        
        report.disputed = true;
        
        emit ReportDisputed(_reportId, msg.sender, _reason);
    }
    
    /**
     * @notice Update token risk profile based on all audits
     * @dev Internal function to aggregate audit data
     * @param _tokenAddress Token to update
     */
    function _updateTokenProfile(address _tokenAddress) internal {
        uint256[] memory audits = tokenAudits[_tokenAddress];
        require(audits.length > 0, "No audits found");
        
        TokenRiskProfile storage profile = tokenProfiles[_tokenAddress];
        
        uint256 totalSecurity = 0;
        uint256 totalLiquidity = 0;
        uint256 totalTokenomics = 0;
        uint256 validAudits = 0;
        
        // Aggregate scores from finalized, non-disputed reports
        for (uint256 i = 0; i < audits.length; i++) {
            AuditReport storage report = auditReports[audits[i]];
            if (report.isFinalized && !report.disputed) {
                totalSecurity += report.riskScores.securityScore;
                totalLiquidity += report.riskScores.liquidityScore;
                totalTokenomics += report.riskScores.tokenomicsScore;
                validAudits++;
            }
        }
        
        if (validAudits > 0) {
            profile.tokenAddress = _tokenAddress;
            profile.totalAudits = audits.length;
            profile.lastAuditTimestamp = block.timestamp;
            profile.averageSecurityScore = uint8(totalSecurity / validAudits);
            profile.averageLiquidityScore = uint8(totalLiquidity / validAudits);
            profile.averageTokenomicsScore = uint8(totalTokenomics / validAudits);
            
            // Calculate weighted overall score
            uint256 overallScore = (
                (totalSecurity * 40) +      // Security weighted 40%
                (totalLiquidity * 30) +     // Liquidity weighted 30%
                (totalTokenomics * 30)      // Tokenomics weighted 30%
            ) / (validAudits * 100);
            
            profile.overallRiskScore = uint8(overallScore);
            profile.consensusRiskLevel = _calculateRiskLevel(uint8(overallScore));
            
            emit TokenProfileUpdated(
                _tokenAddress,
                uint8(overallScore),
                profile.consensusRiskLevel
            );
        }
    }
    
    /**
     * @notice Calculate risk level from score
     * @dev Converts numerical score to categorical risk level
     * @param _score Overall risk score (0-100)
     * @return RiskLevel enum value
     */
    function _calculateRiskLevel(uint8 _score) internal pure returns (RiskLevel) {
        if (_score >= 80) return RiskLevel.VeryLow;
        if (_score >= 65) return RiskLevel.Low;
        if (_score >= 50) return RiskLevel.Medium;
        if (_score >= 30) return RiskLevel.High;
        return RiskLevel.Critical;
    }
    
    /**
     * @notice Blacklist a token due to critical issues
     * @dev Only admin can blacklist tokens
     * @param _tokenAddress Token to blacklist
     * @param _reason Reason for blacklisting
     */
    function blacklistToken(
        address _tokenAddress,
        string memory _reason
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_tokenAddress != address(0), "Invalid address");
        require(bytes(_reason).length > 0, "Reason required");
        
        TokenRiskProfile storage profile = tokenProfiles[_tokenAddress];
        profile.isBlacklisted = true;
        
        emit TokenBlacklisted(_tokenAddress, _reason);
    }
    
    /**
     * @notice Remove token from blacklist
     * @dev Only admin can whitelist tokens
     * @param _tokenAddress Token to whitelist
     */
    function whitelistToken(address _tokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_tokenAddress != address(0), "Invalid address");
        
        TokenRiskProfile storage profile = tokenProfiles[_tokenAddress];
        profile.isBlacklisted = false;
        
        emit TokenWhitelisted(_tokenAddress);
    }
    
    /**
     * @notice Get all reports for a specific token
     * @param _tokenAddress Token address
     * @return Array of report IDs
     */
    function getTokenAudits(address _tokenAddress) external view returns (uint256[] memory) {
        return tokenAudits[_tokenAddress];
    }
    
    /**
     * @notice Get all reports by a specific auditor
     * @param _auditor Auditor address
     * @return Array of report IDs
     */
    function getAuditorReports(address _auditor) external view returns (uint256[] memory) {
        return auditorReports[_auditor];
    }
    
    /**
     * @notice Get all reports for a specific job
     * @param _jobId Job ID
     * @return Array of report IDs
     */
    function getJobReports(uint256 _jobId) external view returns (uint256[] memory) {
        return jobReports[_jobId];
    }
    
    /**
     * @notice Get complete audit report details
     * @param _reportId Report ID
     * @return Complete audit report struct
     */
    function getAuditReport(uint256 _reportId) external view returns (
        uint256 reportId,
        uint256 jobId,
        address tokenAddress,
        address auditor,
        RiskScores memory riskScores,
        string memory ipfsHash,
        uint256 timestamp,
        bool isFinalized,
        bool disputed
    ) {
        AuditReport storage report = auditReports[_reportId];
        require(report.reportId != 0, "Report does not exist");
        
        return (
            report.reportId,
            report.jobId,
            report.tokenAddress,
            report.auditor,
            report.riskScores,
            report.ipfsHash,
            report.timestamp,
            report.isFinalized,
            report.disputed
        );
    }
    
    /**
     * @notice Get audit findings for a report
     * @param _reportId Report ID
     * @return findings struct
     */
    function getAuditFindings(uint256 _reportId) external view returns (AuditFindings memory) {
        AuditReport storage report = auditReports[_reportId];
        require(report.reportId != 0, "Report does not exist");
        return report.findings;
    }
    
    /**
     * @notice Check if token is safe to trade based on consensus
     * @param _tokenAddress Token to check
     * @return isSafe Boolean indicating if token meets safety threshold
     * @return overallScore Consensus risk score
     */
    function isTokenSafe(address _tokenAddress) external view returns (
        bool isSafe,
        uint8 overallScore
    ) {
        TokenRiskProfile storage profile = tokenProfiles[_tokenAddress];
        
        if (profile.isBlacklisted) {
            return (false, 0);
        }
        
        if (profile.totalAudits < CONSENSUS_THRESHOLD) {
            return (false, 0);
        }
        
        overallScore = profile.overallRiskScore;
        isSafe = overallScore >= MIN_SCORE_THRESHOLD;
        
        return (isSafe, overallScore);
    }
    
    /**
     * @notice Grant agent role to an address
     * @param _agent Address to grant role
     */
    function grantAgentRole(address _agent) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(AGENT_ROLE, _agent);
        emit AgentRoleGranted(_agent);
    }
    
    /**
     * @notice Grant auditor role to an address
     * @param _auditor Address to grant role
     */
    function grantAuditorRole(address _auditor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(AUDITOR_ROLE, _auditor);
        emit AuditorRoleGranted(_auditor);
    }
}

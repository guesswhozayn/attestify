// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Attestify
 * @dev Academic credential verification contract
 */
contract Attestify is Ownable, ReentrancyGuard {
    
    struct Credential {
        string studentId;
        bytes32 certificateHash;
        string ipfsCID;
        uint256 issuedAt;
        bool isRevoked;
        address issuedBy;
    }
    
    // Mappings
    mapping(string => Credential) public credentials;
    mapping(string => bool) public isIssued;
    mapping(address => bool) public authorizedIssuers;
    
    // Events
    event CredentialIssued(
        string indexed studentId, 
        bytes32 certificateHash, 
        string ipfsCID, 
        uint256 timestamp,
        address indexed issuer
    );
    
    event CredentialRevoked(
        string indexed studentId, 
        uint256 timestamp,
        address indexed revokedBy
    );
    
    event IssuerAuthorized(address indexed issuer, uint256 timestamp);
    event IssuerRevoked(address indexed issuer, uint256 timestamp);
    
    // Modifiers
    modifier onlyAuthorized() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner(),
            "Not authorized to issue credentials"
        );
        _;
    }
    
    modifier credentialExists(string memory _studentId) {
        require(isIssued[_studentId], "Credential not found");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        authorizedIssuers[msg.sender] = true;
    }
    
    /**
     * @dev Issue a new credential
     * @param _studentId Unique student identifier
     * @param _certificateHash SHA-256 hash of the certificate
     * @param _ipfsCID IPFS Content Identifier
     */
    function issueCertificate(
        string memory _studentId,
        bytes32 _certificateHash,
        string memory _ipfsCID
    ) public onlyAuthorized nonReentrant {
        require(!isIssued[_studentId], "Credential already issued");
        require(_certificateHash != bytes32(0), "Invalid certificate hash");
        require(bytes(_ipfsCID).length > 0, "Invalid IPFS CID");
        
        credentials[_studentId] = Credential({
            studentId: _studentId,
            certificateHash: _certificateHash,
            ipfsCID: _ipfsCID,
            issuedAt: block.timestamp,
            isRevoked: false,
            issuedBy: msg.sender
        });
        
        isIssued[_studentId] = true;
        
        emit CredentialIssued(
            _studentId,
            _certificateHash,
            _ipfsCID,
            block.timestamp,
            msg.sender
        );
    }
    
    /**
     * @dev Revoke a credential
     * @param _studentId Student identifier
     */
    function revokeCertificate(string memory _studentId) 
        public 
        onlyAuthorized 
        credentialExists(_studentId) 
        nonReentrant 
    {
        require(!credentials[_studentId].isRevoked, "Already revoked");
        
        credentials[_studentId].isRevoked = true;
        
        emit CredentialRevoked(_studentId, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Get credential details
     * @param _studentId Student identifier
     * @return certificateHash Certificate hash
     * @return ipfsCID IPFS identifier
     * @return issuedAt Timestamp
     * @return isRevoked Revocation status
     */
    function getCredential(string memory _studentId)
        public
        view
        credentialExists(_studentId)
        returns (
            bytes32 certificateHash,
            string memory ipfsCID,
            uint256 issuedAt,
            bool isRevoked
        )
    {
        Credential memory cred = credentials[_studentId];
        return (
            cred.certificateHash,
            cred.ipfsCID,
            cred.issuedAt,
            cred.isRevoked
        );
    }
    
    /**
     * @dev Verify a credential by comparing hash
     * @param _studentId Student identifier
     * @param _hash Hash to verify
     * @return bool True if valid and not revoked
     */
    function verifyCredential(string memory _studentId, bytes32 _hash)
        public
        view
        returns (bool)
    {
        if (!isIssued[_studentId]) {
            return false;
        }
        
        Credential memory cred = credentials[_studentId];
        return (cred.certificateHash == _hash && !cred.isRevoked);
    }
    
    /**
     * @dev Authorize a new issuer
     * @param _issuer Address to authorize
     */
    function authorizeIssuer(address _issuer) public onlyOwner {
        require(_issuer != address(0), "Invalid address");
        require(!authorizedIssuers[_issuer], "Already authorized");
        
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer, block.timestamp);
    }
    
    /**
     * @dev Revoke issuer authorization
     * @param _issuer Address to revoke
     */
    function revokeIssuer(address _issuer) public onlyOwner {
        require(authorizedIssuers[_issuer], "Not an authorized issuer");
        
        authorizedIssuers[_issuer] = false;
        emit IssuerRevoked(_issuer, block.timestamp);
    }
    
    /**
     * @dev Check if an address is authorized
     * @param _issuer Address to check
     * @return bool Authorization status
     */
    function isAuthorizedIssuer(address _issuer) public view returns (bool) {
        return authorizedIssuers[_issuer];
    }
    
    /**
     * @dev Get credential issuer
     * @param _studentId Student identifier
     * @return address Issuer address
     */
    function getIssuer(string memory _studentId) 
        public 
        view 
        credentialExists(_studentId)
        returns (address) 
    {
        return credentials[_studentId].issuedBy;
    }
}
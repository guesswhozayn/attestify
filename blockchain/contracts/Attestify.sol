// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Attestify
 * @dev Credential verification contract with Soulbound Token (SBT) and batch issuance support.
 */
contract Attestify is ERC721URIStorage, Ownable, ReentrancyGuard {
    
    uint256 private _nextTokenId;

    struct Credential {
        string studentId;
        bytes32 certificateHash;
        string ipfsCID;
        uint256 issuedAt;
        bool isRevoked;
        address issuedBy;
    }
    
    mapping(string => Credential) public credentials;
    mapping(string => bool) public isIssued;
    mapping(address => bool) public authorizedIssuers;
    
    event CredentialIssued(string indexed studentId, bytes32 certificateHash, string ipfsCID, uint256 timestamp, address indexed issuer);
    event CredentialRevoked(string indexed studentId, uint256 timestamp, address indexed revokedBy);
    event IssuerAuthorized(address indexed issuer, uint256 timestamp);
    event IssuerRevoked(address indexed issuer, uint256 timestamp);
    event SoulboundMinted(address indexed to, uint256 indexed tokenId, string uri);
    event SoulboundRevoked(uint256 indexed tokenId);
    
    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier credentialExists(string memory _studentId) {
        require(isIssued[_studentId], "Credential not found");
        _;
    }
    
    constructor() ERC721("Attestify Credential", "ATTEST") Ownable(msg.sender) {
        authorizedIssuers[msg.sender] = true;
    }
    
    // --- Credential Management ---

    function issueCertificate(string memory _studentId, bytes32 _certificateHash, string memory _ipfsCID) public onlyAuthorized nonReentrant {
        _issueSingle(_studentId, _certificateHash, _ipfsCID);
    }

    function issueCertificateBatch(string[] memory _studentIds, bytes32[] memory _certificateHashes, string[] memory _ipfsCIDs) public onlyAuthorized nonReentrant {
        require(_studentIds.length == _certificateHashes.length && _studentIds.length == _ipfsCIDs.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < _studentIds.length; i++) {
            _issueSingle(_studentIds[i], _certificateHashes[i], _ipfsCIDs[i]);
        }
    }

    function _issueSingle(string memory _studentId, bytes32 _certificateHash, string memory _ipfsCID) internal {
        require(!isIssued[_studentId], "Already issued");
        require(_certificateHash != bytes32(0), "Invalid hash");
        
        credentials[_studentId] = Credential({
            studentId: _studentId,
            certificateHash: _certificateHash,
            ipfsCID: _ipfsCID,
            issuedAt: block.timestamp,
            isRevoked: false,
            issuedBy: msg.sender
        });
        
        isIssued[_studentId] = true;
        
        emit CredentialIssued(_studentId, _certificateHash, _ipfsCID, block.timestamp, msg.sender);
    }

    function revokeCertificate(string memory _studentId) public onlyAuthorized credentialExists(_studentId) nonReentrant {
        require(!credentials[_studentId].isRevoked, "Already revoked");
        credentials[_studentId].isRevoked = true;
        emit CredentialRevoked(_studentId, block.timestamp, msg.sender);
    }

    // --- Soulbound Token Management ---

    function safeMint(address to, string memory uri) public onlyAuthorized returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mintSingle(to, tokenId, uri);
        return tokenId;
    }

    function safeMintBatch(address[] memory recipients, string[] memory uris) public onlyAuthorized returns (uint256[] memory) {
        require(recipients.length == uris.length, "Arrays length mismatch");
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _nextTokenId++;
            _mintSingle(recipients[i], tokenId, uris[i]);
            tokenIds[i] = tokenId;
        }
        return tokenIds;
    }

    function _mintSingle(address to, uint256 tokenId, string memory uri) internal {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit SoulboundMinted(to, tokenId, uri);
    }

    function revokeToken(uint256 tokenId) public onlyAuthorized {
        _burn(tokenId);
        emit SoulboundRevoked(tokenId);
    }
    
    // --- Overrides ---

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Only allow minting (from == 0) and burning (to == 0)
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

    // --- View Functions ---

    function getCredential(string memory _studentId) public view credentialExists(_studentId) returns (bytes32, string memory, uint256, bool) {
        Credential memory cred = credentials[_studentId];
        return (cred.certificateHash, cred.ipfsCID, cred.issuedAt, cred.isRevoked);
    }
    
    function verifyCredential(string memory _studentId, bytes32 _hash) public view returns (bool) {
        if (!isIssued[_studentId]) return false;
        Credential memory cred = credentials[_studentId];
        return (cred.certificateHash == _hash && !cred.isRevoked);
    }

    function authorizeIssuer(address _issuer) public onlyOwner {
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer, block.timestamp);
    }
    
    function revokeIssuer(address _issuer) public onlyOwner {
        authorizedIssuers[_issuer] = false;
        emit IssuerRevoked(_issuer, block.timestamp);
    }
    
    function isAuthorizedIssuer(address _issuer) public view returns (bool) {
        return authorizedIssuers[_issuer];
    }
    
    function getIssuer(string memory _studentId) public view credentialExists(_studentId) returns (address) {
        return credentials[_studentId].issuedBy;
    }
}
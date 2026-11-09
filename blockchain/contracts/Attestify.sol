// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
    mapping(uint256 => address) public tokenIssuers;

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

    function revokeCertificate(string memory _studentId) public onlyAuthorized credentialExists(_studentId) nonReentrant {
        require(credentials[_studentId].issuedBy == msg.sender || msg.sender == owner(), "Not original issuer");
        require(!credentials[_studentId].isRevoked, "Already revoked");
        credentials[_studentId].isRevoked = true;
        emit CredentialRevoked(_studentId, block.timestamp, msg.sender);
    }

    function _mintSingle(address to, uint256 tokenId, string memory uri) internal {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit SoulboundMinted(to, tokenId, uri);
    }

    function issueUnifiedCredential(
        address to,
        string memory _studentId,
        bytes32 _certificateHash,
        string memory _ipfsCID,
        string memory uri
    ) public onlyAuthorized nonReentrant returns (uint256) {
        require(!isIssued[_studentId], "Already issued");
        require(_certificateHash != bytes32(0), "Invalid hash");

        uint256 tokenId = _nextTokenId++;

        credentials[_studentId] = Credential({
            studentId: _studentId,
            certificateHash: _certificateHash,
            ipfsCID: _ipfsCID,
            issuedAt: block.timestamp,
            isRevoked: false,
            issuedBy: msg.sender
        });

        isIssued[_studentId] = true;
        tokenIssuers[tokenId] = msg.sender;

        _mintSingle(to, tokenId, uri);

        emit CredentialIssued(_studentId, _certificateHash, _ipfsCID, block.timestamp, msg.sender);
        return tokenId;
    }

    function revokeToken(uint256 tokenId) public onlyAuthorized {
        require(tokenIssuers[tokenId] == msg.sender || msg.sender == owner(), "Not original issuer");
        _burn(tokenId);
        emit SoulboundRevoked(tokenId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

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

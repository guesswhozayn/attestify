const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Attestify", function () {
  let attestify;
  let owner;
  let issuer;
  let user;
  
  const studentId = "12345";
  const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("certificate data"));
  const ipfsCID = "QmTest123";

  beforeEach(async function () {
    [owner, issuer, user] = await ethers.getSigners();
    
    const Attestify = await ethers.getContractFactory("Attestify");
    attestify = await Attestify.deploy();
    await attestify.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await attestify.owner()).to.equal(owner.address);
    });

    it("Should authorize deployer as issuer", async function () {
      expect(await attestify.authorizedIssuers(owner.address)).to.be.true;
    });
  });

  describe("Issue Credential", function () {
    it("Should issue a credential successfully", async function () {
      await expect(
        attestify.issueCertificate(studentId, certificateHash, ipfsCID)
      )
        .to.emit(attestify, "CredentialIssued")
        .withArgs(studentId, certificateHash, ipfsCID, anyValue, owner.address);
      
      expect(await attestify.isIssued(studentId)).to.be.true;
    });

    it("Should not allow duplicate credentials", async function () {
      await attestify.issueCertificate(studentId, certificateHash, ipfsCID);
      
      await expect(
        attestify.issueCertificate(studentId, certificateHash, ipfsCID)
      ).to.be.revertedWith("Credential already issued");
    });

    it("Should not allow unauthorized issuers", async function () {
      await expect(
        attestify.connect(user).issueCertificate(studentId, certificateHash, ipfsCID)
      ).to.be.revertedWith("Not authorized to issue credentials");
    });
  });

  describe("Revoke Credential", function () {
    beforeEach(async function () {
      await attestify.issueCertificate(studentId, certificateHash, ipfsCID);
    });

    it("Should revoke a credential", async function () {
      await expect(attestify.revokeCertificate(studentId))
        .to.emit(attestify, "CredentialRevoked")
        .withArgs(studentId, anyValue, owner.address);
      
      const [, , , isRevoked] = await attestify.getCredential(studentId);
      expect(isRevoked).to.be.true;
    });

    it("Should not revoke twice", async function () {
      await attestify.revokeCertificate(studentId);
      
      await expect(
        attestify.revokeCertificate(studentId)
      ).to.be.revertedWith("Already revoked");
    });
  });

  describe("Verify Credential", function () {
    beforeEach(async function () {
      await attestify.issueCertificate(studentId, certificateHash, ipfsCID);
    });

    it("Should verify valid credential", async function () {
      const isValid = await attestify.verifyCredential(studentId, certificateHash);
      expect(isValid).to.be.true;
    });

    it("Should not verify with wrong hash", async function () {
      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong data"));
      const isValid = await attestify.verifyCredential(studentId, wrongHash);
      expect(isValid).to.be.false;
    });

    it("Should not verify revoked credential", async function () {
      await attestify.revokeCertificate(studentId);
      const isValid = await attestify.verifyCredential(studentId, certificateHash);
      expect(isValid).to.be.false;
    });
  });

  describe("Authorization", function () {
    it("Should authorize new issuer", async function () {
      await expect(attestify.authorizeIssuer(issuer.address))
        .to.emit(attestify, "IssuerAuthorized");
      
      expect(await attestify.isAuthorizedIssuer(issuer.address)).to.be.true;
    });

    it("Should allow authorized issuer to issue", async function () {
      await attestify.authorizeIssuer(issuer.address);
      
      await expect(
        attestify.connect(issuer).issueCertificate(studentId, certificateHash, ipfsCID)
      ).to.not.be.reverted;
    });

    it("Should revoke issuer authorization", async function () {
      await attestify.authorizeIssuer(issuer.address);
      await attestify.revokeIssuer(issuer.address);
      
      expect(await attestify.isAuthorizedIssuer(issuer.address)).to.be.false;
    });
  });
});
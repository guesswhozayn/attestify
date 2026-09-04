const mongoose = require('mongoose');
const Credential = require('../models/Credential');
const User = require('../models/User');
const blockchainService = require('./blockchainService');
const ipfsService = require('./ipfsService');
const hashService = require('./hashService');
const pdfService = require('./pdfService');
const emailService = require('./emailService');

class CredentialIssuanceService {
  async prepareSBTMetadata(user, credentialData, ipfsCID) {
    const metadata = {
      name: `${credentialData.type === 'TRANSCRIPT' ? 'Academic Transcript' : 'Certification'}: ${credentialData.studentName}`,
      description: `A verifiable digital credential issued by ${credentialData.university} on ${new Date(credentialData.issueDate).toLocaleDateString()}. Secured by Attestify.`,
      image: null,
      external_url: `${process.env.FRONTEND_URL}/dashboard`,
      attributes: [
        { trait_type: "Degree Type", value: credentialData.type },
        { trait_type: "Issued By", value: credentialData.university },
        { trait_type: "Issuer Wallet", value: user.walletAddress },
        { trait_type: "Issuer Registration", value: user.issuerDetails?.registrationNumber || "N/A" },
        { trait_type: "Issue Date", value: new Date(credentialData.issueDate).toISOString().split('T')[0] },
        { trait_type: "PDF Proof", value: `ipfs://${ipfsCID}` },
        { trait_type: "Status", value: "Verified" }
      ]
    };
    const result = await ipfsService.uploadJSON(metadata, `SBT_Metadata_${credentialData._id}.json`);
    return `ipfs://${result.ipfsHash}`;
  }

  async processIssuance(data, reqUser) {
    const { 
      studentWalletAddress, studentName, university, issueDate, type, 
      transcriptData, certificationData, studentImageBuffer, studentImageName
    } = data;

    const credentialId = data.credentialId || new mongoose.Types.ObjectId().toString();
    const normalizedStudentWallet = studentWalletAddress?.toLowerCase().trim();
    const parsedIssueDate = new Date(issueDate);

    const institutionName = reqUser.issuerDetails?.institutionName || university || 'Attestify';
    const issuerWalletAddress = reqUser.walletAddress;
    const issuerRegistration = reqUser.issuerDetails?.registrationNumber || '';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify/${credentialId}`;

    const pdfBuffer = await pdfService.generateCredentialPDF({
      type,
      studentName,
      studentWalletAddress: normalizedStudentWallet,
      university,
      issueDate: parsedIssueDate,
      credentialId,
      transcriptData,
      certificationData,
      verificationUrl,
      institutionName,
      issuerWalletAddress,
      issuerRegistration
    });

    const certificateHash = hashService.generateSHA256FromBuffer(pdfBuffer);
    const ipfsResult = await ipfsService.uploadFile(pdfBuffer, `Certificate_${credentialId}.pdf`);

    let studentImageUrl = null;
    if (studentImageBuffer) {
      try {
        const imageIpfsResult = await ipfsService.uploadFile(studentImageBuffer, `${credentialId}_image_${studentImageName}`);
        studentImageUrl = ipfsService.getIPFSUrl(imageIpfsResult.ipfsHash);
      } catch (uploadError) {
        console.error('Failed to upload student image to IPFS:', uploadError);
      }
    }

    const credentialDataForMetadata = {
      _id: credentialId,
      studentWalletAddress: normalizedStudentWallet,
      studentName,
      university: institutionName,
      issueDate: parsedIssueDate,
      type,
    };

    const metadataURI = await this.prepareSBTMetadata(reqUser, credentialDataForMetadata, ipfsResult.ipfsHash);
    
    const blockchainResult = await blockchainService.issueUnifiedCredential(
      normalizedStudentWallet,
      credentialId,
      certificateHash,
      ipfsResult.ipfsHash,
      metadataURI
    );

    let credential = await Credential.findById(credentialId);
    if (!credential) {
      credential = new Credential({ _id: credentialId });
    }

    credential.studentWalletAddress = normalizedStudentWallet;
    credential.studentName = studentName;
    credential.university = institutionName;
    credential.issueDate = parsedIssueDate;
    credential.type = type;
    credential.transcriptData = transcriptData;
    credential.certificationData = certificationData;
    credential.issuedBy = reqUser._id;
    credential.studentImage = studentImageUrl;
    credential.certificateHash = certificateHash;
    credential.ipfsCID = ipfsResult.ipfsHash;
    credential.transactionHash = blockchainResult.transactionHash;
    credential.blockNumber = blockchainResult.blockNumber;
    credential.gasUsed = blockchainResult.gasUsed;
    credential.gasPrice = blockchainResult.gasPrice;
    credential.totalCost = blockchainResult.totalCost;
    credential.tokenId = blockchainResult.tokenId;
    credential.metadata = {
      fileSize: pdfBuffer.length,
      fileType: 'application/pdf',
      originalFileName: `Certificate_${credentialId}.pdf`
    };

    credential.status = 'COMPLETED';

    await credential.save();

    const userDoc = await User.findById(reqUser._id);
    if (userDoc) {
      if (!userDoc.issuerDetails) {
        userDoc.issuerDetails = {};
      }
      userDoc.issuerDetails.certificatesIssued = (userDoc.issuerDetails.certificatesIssued || 0) + 1;
      await userDoc.save();
    }

    const studentUser = await User.findOne({ walletAddress: normalizedStudentWallet });
    if (studentUser && studentUser.email) {
      const emailData = {
        studentName,
        university: institutionName,
        issueDate: parsedIssueDate,
        transactionHash: blockchainResult.transactionHash,
        id: credential._id,
        ipfsCID: ipfsResult.ipfsHash,
        certificateLink: `${process.env.FRONTEND_URL}/dashboard`,
        loginLink: `${process.env.FRONTEND_URL}/login`,
        tokenId: credential.tokenId
      };
      emailService.sendCertificateIssued(studentUser.email, emailData).catch(err =>
        console.error(`[EmailService] Failed to send issuance email to ${studentUser.email}:`, err)
      );
    }

    return {
      credential,
      blockchainResult,
      ipfsResult
    };
  }
}

module.exports = new CredentialIssuanceService();

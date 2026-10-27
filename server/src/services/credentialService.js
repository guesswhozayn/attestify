const crypto = require('crypto');
const { prisma } = require('../config/database');
const blockchainService = require('./blockchainService');
const ipfsService = require('./ipfsService');
const hashService = require('./hashService');
const pdfService = require('./pdfService');

class CredentialService {
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
    const result = await ipfsService.uploadJSON(metadata, `SBT_Metadata_${credentialData.id}.json`);
    return `ipfs://${result.ipfsHash}`;
  }

  async processIssuance(data, reqUser) {
    const {
      studentWalletAddress, studentName, university, issueDate, type,
      transcriptData, certificationData, studentImageBuffer, studentImageName
    } = data;

    const credentialId = data.credentialId || crypto.randomUUID();
    const normalizedStudentWallet = studentWalletAddress?.toLowerCase().trim();
    const parsedIssueDate = new Date(issueDate);
    const institutionName = reqUser.issuerDetails?.institutionName || university || 'Attestify';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const pdfBuffer = await pdfService.generateCredentialPDF({
      type, studentName,
      studentWalletAddress: normalizedStudentWallet,
      university, issueDate: parsedIssueDate, credentialId,
      transcriptData, certificationData,
      verificationUrl: `${frontendUrl}/verify/${credentialId}`,
      institutionName,
      issuerWalletAddress: reqUser.walletAddress,
      issuerRegistration: reqUser.issuerDetails?.registrationNumber || ''
    });

    const [certificateHash, ipfsResult] = await Promise.all([
      Promise.resolve(hashService.generateSHA256FromBuffer(pdfBuffer)),
      ipfsService.uploadFile(pdfBuffer, `Certificate_${credentialId}.pdf`)
    ]);

    let studentImageUrl = null;
    if (studentImageBuffer) {
      try {
        const imageIpfsResult = await ipfsService.uploadFile(studentImageBuffer, `${credentialId}_image_${studentImageName}`);
        studentImageUrl = ipfsService.getIPFSUrl(imageIpfsResult.ipfsHash);
      } catch (uploadError) {
        console.error('Failed to upload student image to IPFS:', uploadError);
      }
    }

    const metadataURI = await this.prepareSBTMetadata(reqUser, {
      id: credentialId, studentWalletAddress: normalizedStudentWallet,
      studentName, university: institutionName, issueDate: parsedIssueDate, type
    }, ipfsResult.ipfsHash);

    const blockchainResult = await blockchainService.issueUnifiedCredential(
      normalizedStudentWallet, credentialId, certificateHash, ipfsResult.ipfsHash, metadataURI
    );

    const userId = reqUser.id;
    const credential = await prisma.credential.upsert({
      where: { id: credentialId },
      update: {
        studentWalletAddress: normalizedStudentWallet,
        studentName,
        university: institutionName,
        issueDate: parsedIssueDate,
        type,
        transcriptData,
        certificationData,
        issuedById: userId,
        studentImage: studentImageUrl,
        certificateHash,
        ipfsCID: ipfsResult.ipfsHash,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed,
        gasPrice: blockchainResult.gasPrice,
        totalCost: blockchainResult.totalCost,
        tokenId: blockchainResult.tokenId,
        metadata: { fileSize: pdfBuffer.length, fileType: 'application/pdf', originalFileName: `Certificate_${credentialId}.pdf` },
        status: 'COMPLETED'
      },
      create: {
        id: credentialId,
        studentWalletAddress: normalizedStudentWallet,
        studentName,
        university: institutionName,
        issueDate: parsedIssueDate,
        type,
        transcriptData,
        certificationData,
        issuedById: userId,
        studentImage: studentImageUrl,
        certificateHash,
        ipfsCID: ipfsResult.ipfsHash,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed,
        gasPrice: blockchainResult.gasPrice,
        totalCost: blockchainResult.totalCost,
        tokenId: blockchainResult.tokenId,
        metadata: { fileSize: pdfBuffer.length, fileType: 'application/pdf', originalFileName: `Certificate_${credentialId}.pdf` },
        status: 'COMPLETED'
      }
    });

    const userRecord = await prisma.user.findUnique({ where: { id: userId } });
    if (userRecord?.issuerDetails) {
      const issuerDetails = { ...userRecord.issuerDetails };
      issuerDetails.certificatesIssued = (issuerDetails.certificatesIssued || 0) + 1;
      await prisma.user.update({
        where: { id: userId },
        data: { issuerDetails }
      });
    }

    return { credential, blockchainResult, ipfsResult };
  }
}

module.exports = new CredentialService();

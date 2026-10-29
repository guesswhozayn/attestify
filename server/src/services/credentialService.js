const crypto = require('crypto');
const fs = require('fs');
const { prisma } = require('../config/database');
const blockchainService = require('./blockchainService');
const ipfsService = require('./ipfsService');
const hashService = require('./hashService');
const pdfService = require('./pdfService');

class CredentialService {
  async prepareSBTMetadata(user, credentialData, ipfsCID, imageUrl = null) {
    const metadata = {
      name: `${credentialData.type === 'TRANSCRIPT' ? 'Academic Transcript' : 'Certification'}: ${credentialData.studentName}`,
      description: `A verifiable digital credential issued by ${credentialData.university} on ${new Date(credentialData.issueDate).toLocaleDateString()}. Secured by Attestify.`,
      image: imageUrl || null,
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

    const existingCred = await prisma.credential.findUnique({ where: { id: credentialId } });
    if (existingCred?.status === 'COMPLETED' && existingCred.transactionHash) {
      return { credential: existingCred };
    }

    const onChainDetails = await blockchainService.getOnChainIssuanceDetails(credentialId);
    if (onChainDetails?.isIssued) {
      const syncedCred = await prisma.credential.upsert({
        where: { id: credentialId },
        update: {
          status: 'COMPLETED',
          certificateHash: onChainDetails.certificateHash || existingCred?.certificateHash,
          ipfsCID: onChainDetails.ipfsCID || existingCred?.ipfsCID,
          transactionHash: onChainDetails.transactionHash || existingCred?.transactionHash,
          blockNumber: onChainDetails.blockNumber || existingCred?.blockNumber,
          tokenId: onChainDetails.tokenId || existingCred?.tokenId,
          processingError: null
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
          issuedById: reqUser.id,
          certificateHash: onChainDetails.certificateHash || '0x',
          ipfsCID: onChainDetails.ipfsCID || '',
          transactionHash: onChainDetails.transactionHash || '',
          blockNumber: onChainDetails.blockNumber || 0,
          tokenId: onChainDetails.tokenId || null,
          status: 'COMPLETED'
        }
      });

      const userRecord = await prisma.user.findUnique({ where: { id: reqUser.id } });
      if (userRecord?.issuerDetails) {
        const issuerDetails = { ...userRecord.issuerDetails };
        issuerDetails.certificatesIssued = (issuerDetails.certificatesIssued || 0) + 1;
        await prisma.user.update({
          where: { id: reqUser.id },
          data: { issuerDetails }
        });
      }

      return { credential: syncedCred };
    }

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
    let imageBuffer = studentImageBuffer;
    if (!imageBuffer && data.studentImagePath && fs.existsSync(data.studentImagePath)) {
      try {
        imageBuffer = fs.readFileSync(data.studentImagePath);
      } catch (readErr) {
        console.warn('Failed to read student image from path:', readErr.message);
      }
    }

    if (imageBuffer) {
      try {
        const imageIpfsResult = await ipfsService.uploadFile(imageBuffer, `${credentialId}_image_${studentImageName || 'student_image.png'}`);
        studentImageUrl = ipfsService.getIPFSUrl(imageIpfsResult.ipfsHash);
      } catch (uploadError) {
        console.error('Failed to upload student image to IPFS:', uploadError);
      }
    }

    const metadataURI = await this.prepareSBTMetadata(reqUser, {
      id: credentialId, studentWalletAddress: normalizedStudentWallet,
      studentName, university: institutionName, issueDate: parsedIssueDate, type
    }, ipfsResult.ipfsHash, studentImageUrl);

    const blockchainResult = await blockchainService.issueUnifiedCredential(
      normalizedStudentWallet, credentialId, certificateHash, ipfsResult.ipfsHash, metadataURI
    );

    if (blockchainResult.status !== 'success' || !blockchainResult.tokenId) {
      throw new Error(`Blockchain issuance failed: transaction ${blockchainResult?.transactionHash || 'unknown'} did not confirm successfully.`);
    }

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
        processingError: null,
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

    if (data.studentImagePath && fs.existsSync(data.studentImagePath)) {
      try { fs.unlinkSync(data.studentImagePath); } catch {}
    }

    return { credential, blockchainResult, ipfsResult };
  }
}

module.exports = new CredentialService();

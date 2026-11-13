const crypto = require('crypto');
const fs = require('fs');
const { prisma } = require('../config/database');
const blockchainService = require('./blockchainService');
const ipfsService = require('./ipfsService');
const hashService = require('./hashService');
const pdfService = require('./pdfService');

const getFrontendUrl = () => {
  const raw = process.env.FRONTEND_URL?.trim();
  if (raw) {
    for (const candidate of raw.split(',').map(s => s.trim()).filter(Boolean)) {
      try {
        const parsed = new URL(candidate);
        if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
          return parsed.origin;
        }
      } catch {
        void 0;
      }
    }
  }
  return 'https://attestify-alpha.vercel.app';
};

class CredentialService {
  async prepareSBTMetadata(user, credentialData, ipfsCID) {
    const frontendUrl = getFrontendUrl();
    const metadata = {
      name: `${credentialData.type === 'TRANSCRIPT' ? 'Academic Transcript' : 'Certification'}: ${credentialData.studentName}`,
      description: `A verifiable digital credential issued by ${credentialData.university} on ${new Date(credentialData.issueDate).toLocaleDateString()}. Secured by Attestify.`,
      image: null,
      external_url: `${frontendUrl}/verify/${credentialData.id}`,
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
      transcriptData, certificationData
    } = data;

    const credentialId = data.credentialId || crypto.randomUUID();
    const normalizedStudentWallet = studentWalletAddress?.toLowerCase().trim();
    const parsedIssueDate = new Date(issueDate);
    const institutionName = reqUser.issuerDetails?.institutionName || university || 'Attestify';
    const frontendUrl = getFrontendUrl();

    const existingCred = await prisma.credential.findUnique({ where: { id: credentialId } });
    if (existingCred?.status === 'COMPLETED' && existingCred.transactionHash) {
      return { credential: existingCred };
    }

    const onChainDetails = await blockchainService.getOnChainIssuanceDetails(credentialId);
    if (onChainDetails?.isIssued) {
      const wasAlreadyCompleted = existingCred?.status === 'COMPLETED';
      const syncedCred = await prisma.credential.upsert({
        where: { id: credentialId },
        update: {
          status: 'COMPLETED',
          certificateHash: onChainDetails.certificateHash || existingCred?.certificateHash,
          ipfsCID: onChainDetails.ipfsCID || existingCred?.ipfsCID,
          transactionHash: onChainDetails.transactionHash || existingCred?.transactionHash,
          blockNumber: onChainDetails.blockNumber || existingCred?.blockNumber,
          gasUsed: onChainDetails.gasUsed || existingCred?.gasUsed,
          gasPrice: onChainDetails.gasPrice || existingCred?.gasPrice,
          totalCost: onChainDetails.totalCost || existingCred?.totalCost,
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
          gasUsed: onChainDetails.gasUsed || null,
          gasPrice: onChainDetails.gasPrice || null,
          totalCost: onChainDetails.totalCost || null,
          tokenId: onChainDetails.tokenId || null,
          status: 'COMPLETED'
        }
      });

      if (!wasAlreadyCompleted) {
        const userRecord = await prisma.user.findUnique({ where: { id: reqUser.id } });
        if (userRecord?.issuerDetails) {
          const issuerDetails = { ...userRecord.issuerDetails };
          issuerDetails.certificatesIssued = (issuerDetails.certificatesIssued || 0) + 1;
          await prisma.user.update({
            where: { id: reqUser.id },
            data: { issuerDetails }
          });
        }
      }

      return { credential: syncedCred };
    }

    let certificateHash = existingCred?.certificateHash && !existingCred.certificateHash.startsWith('PENDING_')
      ? existingCred.certificateHash
      : null;
    let ipfsCID = existingCred?.ipfsCID || null;
    let metadataURI = existingCred?.metadata?.tokenURI || null;
    let pdfByteLength = existingCred?.metadata?.fileSize || 0;

    if (!certificateHash || !ipfsCID || !metadataURI) {
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
      pdfByteLength = pdfBuffer.length;

      const [computedHash, ipfsResult] = await Promise.all([
        Promise.resolve(hashService.generateSHA256FromBuffer(pdfBuffer)),
        ipfsService.uploadFile(pdfBuffer, `Certificate_${credentialId}.pdf`)
      ]);
      certificateHash = computedHash;
      ipfsCID = ipfsResult.ipfsHash;

      metadataURI = await this.prepareSBTMetadata(reqUser, {
        id: credentialId, studentWalletAddress: normalizedStudentWallet,
        studentName, university: institutionName, issueDate: parsedIssueDate, type
      }, ipfsCID);

      if (existingCred) {
        await prisma.credential.update({
          where: { id: credentialId },
          data: {
            certificateHash,
            ipfsCID,
            metadata: {
              fileSize: pdfByteLength,
              fileType: 'application/pdf',
              originalFileName: `Certificate_${credentialId}.pdf`,
              tokenURI: metadataURI
            }
          }
        });
      }
    }

    const blockchainResult = await blockchainService.issueUnifiedCredential(
      normalizedStudentWallet, credentialId, certificateHash, ipfsCID, metadataURI
    );

    if (blockchainResult.status !== 'success' || !blockchainResult.tokenId) {
      throw new Error(`Blockchain issuance failed: transaction ${blockchainResult?.transactionHash || 'unknown'} did not confirm successfully.`);
    }

    const userId = reqUser.id;
    const fileMetadata = {
      fileSize: pdfByteLength,
      fileType: 'application/pdf',
      originalFileName: `Certificate_${credentialId}.pdf`,
      tokenURI: metadataURI
    };
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
        certificateHash,
        ipfsCID,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed,
        gasPrice: blockchainResult.gasPrice,
        totalCost: blockchainResult.totalCost,
        tokenId: blockchainResult.tokenId,
        metadata: fileMetadata,
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
        certificateHash,
        ipfsCID,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed,
        gasPrice: blockchainResult.gasPrice,
        totalCost: blockchainResult.totalCost,
        tokenId: blockchainResult.tokenId,
        metadata: fileMetadata,
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

    return { credential, blockchainResult, ipfsResult: { ipfsHash: ipfsCID } };
  }
}

module.exports = new CredentialService();

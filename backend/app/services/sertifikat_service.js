const sertifikatRepository = require("../repositories/sertifikat_repo");
const { notFoundError, validationError } = require("../core/api_error");

/**
 * Mengambil sertifikat (NftRecord) berdasarkan id.
 * Melempar notFoundError jika tidak ditemukan.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function getSertifikatById(id) {
  if (!id || typeof id !== "string" || !id.trim()) {
    throw validationError("Field 'id' is required");
  }

  const sertifikat = await sertifikatRepository.getSertifikatById(id.trim());

  if (!sertifikat) {
    throw notFoundError(`Sertifikat dengan id '${id}' tidak ditemukan`);
  }

  return {
    id: sertifikat.id,
    teamId: sertifikat.teamId,
    walletAddress: sertifikat.walletAddress,
    contractAddress: sertifikat.contractAddress,
    tokenId: sertifikat.tokenId,
    txHash: sertifikat.txHash,
    network: sertifikat.network,
    metadataUri: sertifikat.metadataUri,
    mintedAt: sertifikat.mintedAt,
    assessment: sertifikat.assessment
      ? {
          id: sertifikat.assessment.id,
          teamId: sertifikat.assessment.teamId,
          finalScore: sertifikat.assessment.finalScore,
          isLocked: sertifikat.assessment.isLocked,
          createdAt: sertifikat.assessment.createdAt,
        }
      : null,
  };
}

module.exports = {
  getSertifikatById,
};

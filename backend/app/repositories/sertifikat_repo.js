const prisma = require("../core/prisma");

/**
 * Mencari satu NftRecord berdasarkan id-nya.
 * NftRecord digunakan sebagai representasi sertifikat digital dalam sistem ini.
 *
 * @param {string} id - CUID dari NftRecord
 * @returns {Promise<object|null>}
 */
function getSertifikatById(id) {
  return prisma.nftRecord.findUnique({
    where: { id },
    include: {
      assessment: true,
    },
  });
}

module.exports = {
  getSertifikatById,
};

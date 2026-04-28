const nftRecords = [];
let nextId = 1;

function createNftRecord(payload) {
  const nftRecord = {
    id: `nft-${nextId++}`,
    assessmentId: payload.assessmentId,
    teamId: payload.teamId,
    walletAddress: payload.walletAddress,
    contractAddress: payload.contractAddress,
    tokenId: payload.tokenId,
    txHash: payload.txHash,
    network: payload.network,
    metadataUri: payload.metadataUri,
    mintedAt: new Date().toISOString(),
    verifyStatus: "mock_verified",
  };

  nftRecords.push(nftRecord);

  return nftRecord;
}

function listNftsByTeam(teamId) {
  return nftRecords.filter((record) => record.teamId === teamId);
}

function getNftById(id) {
  return nftRecords.find((record) => record.id === id) || null;
}

module.exports = {
  createNftRecord,
  listNftsByTeam,
  getNftById,
};

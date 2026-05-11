const documents = [];
let nextId = 1;

function createDocument(payload) {
  const document = {
    id: `document-${nextId++}`,
    teamId: payload.teamId,
    uploaderId: payload.uploaderId,
    fileUrl: payload.fileUrl,
    fileName: payload.fileName,
    fileType: payload.fileType,
    fileSize: payload.fileSize,
    fileHash: payload.fileHash,
    description: payload.description || null,
    createdAt: new Date().toISOString(),
  };

  documents.push(document);

  return document;
}

function listDocumentsByTeam(teamId) {
  return documents.filter((document) => document.teamId === teamId);
}

function getDocumentById(id) {
  return documents.find((document) => document.id === id) || null;
}

module.exports = {
  createDocument,
  listDocumentsByTeam,
  getDocumentById,
};

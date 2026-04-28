const documents = [];
let nextId = 1;

function createDocument(payload) {
  const document = {
    id: nextId++,
    title: payload.title,
    fileName: payload.fileName,
    status: "uploaded",
  };

  documents.push(document);

  return document;
}

function listDocuments() {
  return [...documents];
}

module.exports = {
  createDocument,
  listDocuments,
};

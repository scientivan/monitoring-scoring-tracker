const documentRepository = require("../repositories/document_repo");

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function createDocument(payload = {}) {
  if (!payload.title || typeof payload.title !== "string" || !payload.title.trim()) {
    throw createValidationError("title is required");
  }

  if (
    !payload.fileName ||
    typeof payload.fileName !== "string" ||
    !payload.fileName.trim()
  ) {
    throw createValidationError("fileName is required");
  }

  return documentRepository.createDocument({
    title: payload.title.trim(),
    fileName: payload.fileName.trim(),
  });
}

function listDocuments() {
  return documentRepository.listDocuments();
}

module.exports = {
  createDocument,
  listDocuments,
};

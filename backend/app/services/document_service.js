const documentRepository = require("../repositories/document_repo");
const documentReviewRepository = require("../repositories/document_review_repo");
const { notFoundError, validationError } = require("../core/api_error");

const allowedReviewStatuses = ["pending", "approved", "rejected", "needs_revision"];

function requireString(value, fieldName) {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw validationError(`Field '${fieldName}' is required`);
  }
}

async function createDocument(payload = {}) {
  requireString(payload.teamId, "teamId");
  requireString(payload.uploaderId, "uploaderId");
  requireString(payload.fileUrl, "fileUrl");
  requireString(payload.fileName, "fileName");
  requireString(payload.fileType, "fileType");
  requireString(payload.fileHash, "fileHash");

  if (typeof payload.fileSize !== "number" || payload.fileSize <= 0) {
    throw validationError("Field 'fileSize' must be a positive number");
  }

  return documentRepository.createDocument({
    teamId: payload.teamId.trim(),
    uploaderId: payload.uploaderId.trim(),
    fileUrl: payload.fileUrl.trim(),
    fileName: payload.fileName.trim(),
    fileType: payload.fileType.trim(),
    fileSize: payload.fileSize,
    fileHash: payload.fileHash.trim(),
    description: typeof payload.description === "string" ? payload.description.trim() : null,
  });
}

async function listDocumentsByTeam(teamId) {
  requireString(teamId, "teamId");
  return documentRepository.listDocumentsByTeam(teamId.trim());
}

async function getDocumentById(id) {
  requireString(id, "id");

  const document = await documentRepository.getDocumentById(id.trim());

  if (!document) {
    throw notFoundError(`Document with id '${id}' was not found`);
  }

  return document;
}

async function getDocumentDetail(id) {
  const document = await getDocumentById(id);
  const latestReview = await documentReviewRepository.getLatestReviewByDocumentId(document.id);

  return {
    ...document,
    latestReview,
  };
}

async function getDocumentDownload(id) {
  const document = await getDocumentById(id);

  return {
    id: document.id,
    fileName: document.fileName,
    fileUrl: document.fileUrl,
    downloadStatus: "mock_ready",
  };
}

async function createDocumentReview(documentId, payload = {}) {
  requireString(documentId, "id");
  requireString(payload.reviewerId, "reviewerId");
  requireString(payload.status, "status");

  if (!allowedReviewStatuses.includes(payload.status.trim())) {
    throw validationError(
      "Field 'status' must be one of: pending, approved, rejected, needs_revision",
    );
  }

  const document = await getDocumentById(documentId);

  const review = await documentReviewRepository.createDocumentReview({
    documentId: document.id,
    reviewerId: payload.reviewerId.trim(),
    status: payload.status.trim(),
    notes: typeof payload.notes === "string" ? payload.notes.trim() : null,
  });

  return {
    documentId: document.id,
    review,
  };
}

module.exports = {
  createDocument,
  listDocumentsByTeam,
  getDocumentById,
  getDocumentDetail,
  getDocumentDownload,
  createDocumentReview,
};

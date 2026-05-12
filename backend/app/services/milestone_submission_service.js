const crypto = require("crypto");
const milestoneRepository = require("../repositories/milestone_repo");
const submissionRepository = require("../repositories/milestone_submission_repo");
const eventPublisher = require("./event_publisher");
const documentStorageService = require("./document_storage_service");
const { notFoundError, validationError } = require("../core/api_error");

const allowedStatuses = ["submitted", "approved", "rejected", "needs_revision"];
const allowedReviewStatuses = ["approved", "rejected", "needs_revision"];
const reviewStatusEventTypes = {
  approved: "submission_approved",
  rejected: "submission_rejected",
  needs_revision: "submission_needs_revision",
};

function requireString(value, fieldName) {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw validationError(`Field '${fieldName}' is required`);
  }
}

function normalizeLinks(value) {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  const links = typeof value === "string" ? JSON.parse(value) : value;

  if (!Array.isArray(links)) {
    throw validationError("Field 'links' must be an array");
  }

  return links.map((link, index) => {
    if (typeof link === "string") {
      const trimmedUrl = link.trim();

      if (!trimmedUrl) {
        throw validationError(`Field 'links[${index}]' cannot be empty`);
      }

      return {
        url: trimmedUrl,
        label: null,
      };
    }

    if (!link || typeof link !== "object") {
      throw validationError(`Field 'links[${index}]' must be a string or object`);
    }

    requireString(link.url, `links[${index}].url`);

    return {
      url: link.url.trim(),
      label:
        typeof link.label === "string" && link.label.trim()
          ? link.label.trim()
          : null,
    };
  });
}

function normalizeStatus(value) {
  if (value === undefined) {
    return undefined;
  }

  requireString(value, "status");
  const normalizedStatus = value.trim();

  if (!allowedStatuses.includes(normalizedStatus)) {
    throw validationError(
      "Field 'status' must be one of: submitted, approved, rejected, needs_revision",
    );
  }

  return normalizedStatus;
}

function calculateSha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function validateUploadedProofFile(file) {
  if (!file) {
    return;
  }

  if (!file.buffer || file.buffer.length === 0) {
    throw validationError("Uploaded proof file is empty");
  }
}

function requireSubmissionProof(file, links) {
  if (!file && links.length === 0) {
    throw validationError("Submission proof requires at least one file or link");
  }
}

async function ensureMilestoneExists(milestoneId) {
  const milestone = await milestoneRepository.getMilestoneById(milestoneId);

  if (!milestone) {
    throw notFoundError(`Milestone with id '${milestoneId}' was not found`);
  }

  return milestone;
}

async function createSubmission(payload = {}, file = null) {
  requireString(payload.milestoneId, "milestoneId");
  requireString(payload.studentId, "studentId");
  requireString(payload.description, "description");

  const milestoneId = payload.milestoneId.trim();
  const studentId = payload.studentId.trim();
  const description = payload.description.trim();
  const links = normalizeLinks(payload.links);

  validateUploadedProofFile(file);
  requireSubmissionProof(file, links);
  const milestone = await ensureMilestoneExists(milestoneId);

  if (milestone.studentId !== studentId) {
    throw validationError("Field 'studentId' must match the milestone studentId");
  }

  const fileHash = file ? calculateSha256(file.buffer) : null;
  const { fileUrl, storagePath } = await documentStorageService.uploadSubmissionProofFile({
    milestoneId,
    file,
  });

  try {
    const submission = await submissionRepository.createSubmission({
      milestoneId,
      studentId,
      description,
      fileUrl,
      fileName: file ? file.originalname : null,
      fileType: file ? file.mimetype : null,
      fileSize: file ? file.size : null,
      fileHash,
      links,
      status: "submitted",
    });

    await eventPublisher.publishToEventLog("submission_posted", {
      submissionId: submission.id,
      milestoneId: submission.milestoneId,
      employerId: milestone.employerId,
      studentId: submission.studentId,
      status: submission.status,
      deadline: milestone.deadline,
      submittedAt: submission.submittedAt,
    });

    return submission;
  } catch (error) {
    await documentStorageService.removeDocumentFile(storagePath);
    throw error;
  }
}

async function listSubmissions(filters = {}) {
  const normalizedFilters = {};

  if (filters.milestoneId !== undefined) {
    requireString(filters.milestoneId, "milestoneId");
    normalizedFilters.milestoneId = filters.milestoneId.trim();
  }

  if (filters.studentId !== undefined) {
    requireString(filters.studentId, "studentId");
    normalizedFilters.studentId = filters.studentId.trim();
  }

  if (filters.status !== undefined) {
    normalizedFilters.status = normalizeStatus(filters.status);
  }

  return submissionRepository.listSubmissions(normalizedFilters);
}

async function getSubmissionById(id) {
  requireString(id, "id");

  const submission = await submissionRepository.getSubmissionById(id.trim());

  if (!submission) {
    throw notFoundError(`Submission with id '${id}' was not found`);
  }

  return submission;
}

async function getSubmissionDownload(id) {
  const submission = await getSubmissionById(id);

  if (!submission.fileUrl) {
    throw notFoundError(`Submission with id '${id}' does not have an uploaded file`);
  }

  return {
    id: submission.id,
    fileName: submission.fileName,
    fileUrl: submission.fileUrl,
    downloadStatus: "ready",
  };
}

async function updateSubmissionStatus(id, payload = {}) {
  requireString(id, "id");
  requireString(payload.status, "status");

  const normalizedStatus = payload.status.trim();

  if (!allowedReviewStatuses.includes(normalizedStatus)) {
    throw validationError(
      "Field 'status' must be one of: approved, rejected, needs_revision",
    );
  }

  const existingSubmission = await getSubmissionById(id);
  const updatedSubmission = await submissionRepository.updateSubmissionStatus(
    existingSubmission.id,
    normalizedStatus,
  );

  await eventPublisher.publishToEventLog(reviewStatusEventTypes[normalizedStatus], {
    submissionId: updatedSubmission.id,
    milestoneId: updatedSubmission.milestoneId,
    studentId: updatedSubmission.studentId,
    previousStatus: existingSubmission.status,
    status: updatedSubmission.status,
    updatedAt: updatedSubmission.updatedAt,
  });

  return updatedSubmission;
}

module.exports = {
  createSubmission,
  listSubmissions,
  getSubmissionById,
  getSubmissionDownload,
  updateSubmissionStatus,
};

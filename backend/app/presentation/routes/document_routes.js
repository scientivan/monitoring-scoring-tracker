const express = require("express");
const documentService = require("../../services/document_service");
const { buildErrorResponse } = require("../../core/api_error");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const document = documentService.createDocument(req.body);

    res.status(201).json({
      data: document,
      message: "Document created successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json(buildErrorResponse(error));
  }
});

router.get("/team/:teamId", (req, res) => {
  try {
    const documents = documentService.listDocumentsByTeam(req.params.teamId);

    res.status(200).json({
      data: documents,
      message: "Documents retrieved successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json(buildErrorResponse(error));
  }
});

router.get("/:id/download", (req, res) => {
  try {
    const download = documentService.getDocumentDownload(req.params.id);

    res.status(200).json({
      data: download,
      message: "Document download link retrieved successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json(buildErrorResponse(error));
  }
});

router.get("/:id", (req, res) => {
  try {
    const document = documentService.getDocumentById(req.params.id);

    res.status(200).json({
      data: document,
      message: "Document retrieved successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json(buildErrorResponse(error));
  }
});

module.exports = router;

const express = require("express");
const documentService = require("../../services/document_service");

const router = express.Router();

router.get("/", (req, res) => {
  const documents = documentService.listDocuments();

  res.status(200).json({
    data: documents,
    message: "Documents retrieved successfully",
  });
});

router.post("/", (req, res) => {
  try {
    const document = documentService.createDocument(req.body);

    res.status(201).json({
      data: document,
      message: "Document created successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || "Internal server error",
    });
  }
});

module.exports = router;

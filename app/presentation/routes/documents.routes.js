const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    data: [],
    message: "Documents retrieved successfully",
  });
});

router.post("/", (req, res) => {
  res.status(201).json({
    data: {
      id: 1,
      title: req.body.title || "Sample Document",
      fileName: req.body.fileName || "sample.pdf",
      status: "uploaded",
    },
    message: "Document created successfully",
  });
});

module.exports = router;

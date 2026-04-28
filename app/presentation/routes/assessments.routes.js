const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    data: [],
    message: "Assessments retrieved successfully",
  });
});

router.post("/", (req, res) => {
  res.status(201).json({
    data: {
      id: 1,
      assessor: req.body.assessor || "Sample Assessor",
      score: req.body.score || 0,
      status: "draft",
    },
    message: "Assessment created successfully",
  });
});

module.exports = router;

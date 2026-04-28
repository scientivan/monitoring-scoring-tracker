const express = require("express");
const assessmentService = require("../../services/assessment.service");

const router = express.Router();

router.get("/", (req, res) => {
  const assessments = assessmentService.listAssessments();

  res.status(200).json({
    data: assessments,
    message: "Assessments retrieved successfully",
  });
});

router.post("/", (req, res) => {
  try {
    const assessment = assessmentService.createAssessment(req.body);

    res.status(201).json({
      data: assessment,
      message: "Assessment created successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || "Internal server error",
    });
  }
});

module.exports = router;

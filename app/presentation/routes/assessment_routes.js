const express = require("express");
const assessmentService = require("../../services/assessment_service");
const { buildErrorResponse } = require("../../core/api_error");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const assessment = assessmentService.createAssessment(req.body);

    res.status(201).json({
      data: assessment,
      message: "Assessment created successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json(buildErrorResponse(error));
  }
});

router.post("/:id/lock", (req, res) => {
  try {
    const result = assessmentService.lockAssessment(req.params.id);

    res.status(200).json({
      data: result,
      message: "Assessment locked successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json(buildErrorResponse(error));
  }
});

router.get("/team/:teamId", (req, res) => {
  try {
    const assessments = assessmentService.listAssessmentsByTeam(req.params.teamId);

    res.status(200).json({
      data: assessments,
      message: "Assessments retrieved successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json(buildErrorResponse(error));
  }
});

module.exports = router;

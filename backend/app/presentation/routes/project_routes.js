const express = require("express");
const projectCompletionService = require("../../services/project_completion_service");
const { buildErrorResponse } = require("../../core/api_error");

const router = express.Router();

router.post("/complete", async (req, res) => {
  try {
    const completion = await projectCompletionService.completeProject(req.body);

    res.status(201).json({
      data: completion,
      message: "Project completed successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json(buildErrorResponse(error));
  }
});

module.exports = router;

const express = require("express");
const logbookService = require("../../services/logbook_service");

const router = express.Router();

router.get("/", (req, res) => {
  const logbooks = logbookService.listLogbooks();

  res.status(200).json({
    data: logbooks,
    message: "Logbooks retrieved successfully",
  });
});

router.post("/", (req, res) => {
  try {
    const logbook = logbookService.createLogbook(req.body);

    res.status(201).json({
      data: logbook,
      message: "Logbook created successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || "Internal server error",
    });
  }
});

module.exports = router;

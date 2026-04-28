const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    data: [],
    message: "Logbooks retrieved successfully",
  });
});

router.post("/", (req, res) => {
  res.status(201).json({
    data: {
      id: 1,
      week: req.body.week || 1,
      summary: req.body.summary || "Sample logbook entry",
      status: "submitted",
    },
    message: "Logbook created successfully",
  });
});

module.exports = router;

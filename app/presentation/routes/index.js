const express = require("express");
const documentRoutes = require("./document_routes");
const logbookRoutes = require("./logbook_routes");
const assessmentRoutes = require("./assessment_routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

router.use("/documents", documentRoutes);
router.use("/logbooks", logbookRoutes);
router.use("/assessments", assessmentRoutes);

module.exports = router;

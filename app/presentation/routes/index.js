const express = require("express");
const documentsRoutes = require("./documents.routes");
const logbooksRoutes = require("./logbooks.routes");
const assessmentsRoutes = require("./assessments.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

router.use("/documents", documentsRoutes);
router.use("/logbooks", logbooksRoutes);
router.use("/assessments", assessmentsRoutes);

module.exports = router;

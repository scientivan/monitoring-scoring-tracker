const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/health:
 * get:
 * summary: Cek status kesehatan server
 * tags: [System]
 * description: Endpoint untuk memastikan server Express berjalan dengan baik.
 * responses:
 * 200:
 * description: Server berjalan normal
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * status:
 * type: string
 * example: OK
 * message:
 * type: string
 * example: Server is healthy
 */
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

module.exports = router;

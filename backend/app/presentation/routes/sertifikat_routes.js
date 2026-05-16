const express = require("express");
const sertifikatService = require("../../services/sertifikat_service");
const { buildErrorResponse } = require("../../core/api_error");

const router = express.Router();

/**
 * GET /sertifikat/:id
 * Mengambil satu sertifikat berdasarkan id.
 */
router.get("/:id", async (req, res) => {
  try {
    const sertifikat = await sertifikatService.getSertifikatById(req.params.id);

    res.status(200).json({
      data: sertifikat,
      message: "Sertifikat berhasil ditemukan",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json(buildErrorResponse(error));
  }
});

module.exports = router;

const express = require('express');
const auth = require('../middleware/auth');
const { getProfileSkills, updateProfileSkills } = require('../services/profileService');

const router = express.Router();

/**
 * @openapi
 * /profile/skills:
 *   get:
 *     summary: Ambil skill profile user
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         required: false
 *         schema:
 *           type: string
 *           example: "2024-1"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 student_id: "12345"
 *                 skills:
 *                   - name: "Node.js"
 *                     level: 4
 *       500:
 *         description: Internal error
 */
// GET Profile Skills
router.get('/profile/skills', auth, async (req, res) => {
  try {
    const period = req.query.period || '2024-1';
    const profile = await getProfileSkills(req.user.student_id, period);
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});


/**
 * @openapi
 * /profile/skills:
 *   get:
 *     summary: Ambil skill profile user
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         required: false
 *         schema:
 *           type: string
 *           example: "2024-1"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 student_id: "12345"
 *                 skills:
 *                   - name: "Node.js"
 *                     level: 4
 *       500:
 *         description: Internal error
 */
// PUT Update Profile Skills
router.put('/profile/skills', auth, async (req, res) => {
  try {
    const { skills, sdg_topics, period = '2024-1' } = req.body;
    const profile = await updateProfileSkills(req.user.student_id, period, skills, sdg_topics);
    res.json({ success: true, data: profile, message: 'Profil skill berhasil diperbarui' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
const express = require('express');
const prisma = require('../core/prisma');

const router = express.Router();

function requireServiceKey(req, res, next) {
  const serviceKey = req.headers['x-service-key'];
  if (serviceKey !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(401).json({ error: 'unauthorized_service' });
  }
  next();
}

/**
 * @openapi
 * /internal/check-team/{student_id}:
 *   get:
 *     summary: Internal check apakah student sedang memiliki tim aktif
 *     tags:
 *       - Internal
 *     security:
 *       - serviceKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123456"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 student_id: "123456"
 *                 has_team: true
 *                 role_in_team: "po"
 *                 team_id: "team_001"
 *                 team_name: "Team Alpha"
 *                 status: "forming"
 *       401:
 *         description: Unauthorized service (invalid service key)
 *       500:
 *         description: Internal error
 */
router.get('/internal/check-team/:student_id', requireServiceKey, async (req, res) => {
  try {
    const { student_id } = req.params;

    const member = await prisma.teamMember.findFirst({
      where: {
        studentId: student_id,
        leftAt: null,
        team: { status: { not: 'disbanded' } },
      },
      select: {
        roleInTeam: true,
        team: { select: { id: true, name: true, status: true } },
      },
    });

    if (!member) {
      return res.json({ success: true, data: { student_id, has_team: false } });
    }

    return res.json({
      success: true,
      data: {
        student_id,
        has_team: true,
        role_in_team: member.roleInTeam,
        team_id: member.team.id,
        team_name: member.team.name,
        status: member.team.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;

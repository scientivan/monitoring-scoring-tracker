const prisma = require('../core/prisma');
const teamRepo = require('../repositories/teamRepository');
const poolRepo = require('../repositories/poolRepository');
const { recalculateTeamScores } = require('./advancedScoringService');
const { publishToEventLog } = require('./eventPublisher');

// ── Helper ────────────────────────────────────────────────────────────────
// Helper ini membungkus pembuatan error agar tidak perlu menulis ulang
// const err = new Error(...) di puluhan baris validasi.
function createError(message, status, detail) {
  const err = new Error(message);
  err.status = status;
  err.detail = detail;
  return err;
}

// ── Reads (delegated to repository) ───────────────────────────────────────

async function getTeamById(teamId) {
  return teamRepo.findTeamById(teamId);
}

async function getTeamByPoStudentId(poStudentId) {
  return teamRepo.findTeamByPoStudentId(poStudentId);
}

async function getPoolEntryByStudentAndPeriod(studentId, period) {
  return poolRepo.findEntry(studentId, period);
}

async function getTeamList() {
  return teamRepo.getTeamList();
}

async function getTeamListBySkill(skillName) {
  return teamRepo.getTeamListBySkill(skillName);
}

async function getTeamDetail(teamId) {
  return teamRepo.getTeamDetail(teamId);
}

async function getActiveTeamForMember(studentId) {
  return teamRepo.findActiveTeamForMember(studentId);
}

// ── Writes ─────────────────────────────────────────────────────────────────

async function createTeam({ name, period, createdBy, poStudentId, poStudentName, poProgramStudi }) {
  const existing = await teamRepo.findTeamByPoStudentId(poStudentId);
  if (existing && existing.period === period) {
    throw createError('duplicate_team', 409, 'Mahasiswa sudah punya tim aktif/forming di period ini');
  }

  const team = await prisma.$transaction(async (tx) => {
    const newTeam = await teamRepo.createTeam({ name, period, createdBy, poStudentId }, tx);
    await teamRepo.createMember(
      { teamId: newTeam.id, studentId: poStudentId, studentName: poStudentName, programStudi: poProgramStudi, roleInTeam: 'po' },
      tx
    );
    await poolRepo.updateStatus(poStudentId, period, 'in_team', tx);
    return newTeam;
  });

  publishToEventLog('TEAM_CREATED', {
    team_id: team.id,
    name: team.name,
    period: team.period,
    po_student_id: team.po_student_id,
    created_at: team.created_at,
  }).catch((err) => console.error('[event-publisher] Failed to publish TEAM_CREATED:', err.message));

  return team;
}

async function inviteMemberToTeam({ teamId, inviterStudentId, inviteeStudentId, message = null }) {
  const team = await teamRepo.findTeamById(teamId);
  if (!team) throw createError('team_not_found', 404, 'Tim tidak ditemukan');
  if (team.status !== 'forming') throw createError('invalid_team_status', 400, 'Hanya tim berstatus forming yang bisa mengundang anggota');
  if (team.po_student_id !== inviterStudentId) throw createError('forbidden', 403, 'Hanya PO tim yang boleh mengirim undangan');

  const inviterMember = await teamRepo.findMember(teamId, inviterStudentId);
  if (!inviterMember || inviterMember.role_in_team !== 'po') throw createError('forbidden', 403, 'Hanya PO tim yang boleh mengirim undangan');

  const inviteePoolEntry = await poolRepo.findEntry(inviteeStudentId, team.period);
  if (!inviteePoolEntry) throw createError('invitee_not_found', 404, 'Mahasiswa yang diundang tidak ditemukan di pool pada period ini');
  if (inviteePoolEntry.status === 'withdrawn') throw createError('withdrawn_user', 400, 'Mahasiswa sudah keluar dari pool dan tidak bisa diundang');
  if (inviteePoolEntry.status !== 'waiting') throw createError('invalid_pool_status', 400, `Status mahasiswa saat ini adalah ${inviteePoolEntry.status}, harus waiting`);

  const existingInvite = await teamRepo.findPendingInvite(teamId, inviteeStudentId);
  if (existingInvite) throw createError('duplicate_invite', 409, 'Undangan pending sudah ada untuk mahasiswa ini');

  return teamRepo.createInvite({ teamId, inviterStudentId, inviteeStudentId, message });
}

async function respondToInvite({ inviteId, respondentStudentId, response }) {
  const invite = await teamRepo.findInvite(inviteId);
  if (!invite) throw createError('invite_not_found', 404, 'Undangan tidak ditemukan');
  if (invite.invitee_student_id !== respondentStudentId) throw createError('forbidden', 403, 'Hanya penerima undangan yang boleh merespon');
  if (invite.status !== 'pending') throw createError('invalid_invite_status', 400, `Undangan sudah ${invite.status}`);

  const team = await teamRepo.findTeamById(invite.team_id);
  if (!team) throw createError('team_not_found', 404, 'Tim pada undangan tidak ditemukan');

  const inviteePoolEntry = await poolRepo.findEntry(invite.invitee_student_id, team.period);
  if (!inviteePoolEntry) throw createError('invitee_not_found', 404, 'Mahasiswa penerima undangan tidak ditemukan di pool');

  if (response === 'accepted') {
    const existingMember = await teamRepo.findMember(invite.team_id, invite.invitee_student_id);
    if (existingMember) throw createError('already_member', 409, 'Mahasiswa sudah menjadi anggota tim');
    if (inviteePoolEntry.status !== 'waiting') throw createError('invitee_not_available', 400, `Mahasiswa penerima undangan harus berstatus waiting (Status saat ini: ${inviteePoolEntry.status})`);

    const updatedInvite = await prisma.$transaction(async (tx) => {
      await teamRepo.createMember(
        { teamId: invite.team_id, studentId: invite.invitee_student_id, studentName: inviteePoolEntry.student_name, programStudi: inviteePoolEntry.program_studi },
        tx
      );
      await poolRepo.updateStatus(invite.invitee_student_id, team.period, 'in_team', tx);
      return teamRepo.updateInviteStatus(inviteId, 'accepted', tx);
    });

    publishToEventLog('TEAM_MEMBER_JOINED', {
      team_id: invite.team_id,
      student_id: invite.invitee_student_id,
      period: team.period,
      joined_via: 'invite',
    }).catch((err) => console.error('[event-publisher] Failed to publish TEAM_MEMBER_JOINED:', err.message));

    recalculateTeamScores(invite.team_id, team.period).catch((err) => console.error('[SCORING ERROR]', err));

    return updatedInvite;
  }

  if (response === 'rejected') {
    return teamRepo.updateInviteStatus(inviteId, 'rejected');
  }

  throw createError('invalid_response', 400, 'Response harus accepted atau rejected');
}

async function updateRequiredSkills(teamId, poStudentId, requiredSkills) {
  const team = await teamRepo.findTeamById(teamId);
  if (!team) throw createError('team_not_found', 404, 'Tim tidak ditemukan');
  if (team.po_student_id !== poStudentId) throw createError('forbidden', 403, 'Hanya PO yang bisa update required skills');

  await prisma.$transaction((tx) => teamRepo.replaceRequiredSkills(teamId, requiredSkills, tx));
  return { id: teamId, required_skills: requiredSkills };
}

async function createJoinRequest({ teamId, studentId, message }) {
  const team = await teamRepo.findTeamById(teamId);
  if (!team || team.status !== 'forming') throw createError('invalid_team', 400, 'Tim tidak ditemukan atau tidak berstatus forming');

  const poolCheck = await poolRepo.findEntry(studentId, team.period);
  if (!poolCheck) throw createError('pool_entry_not_found', 404, 'Kamu belum join pool');
  if (poolCheck.status === 'withdrawn') throw createError('withdrawn_user', 400, 'Kamu sudah keluar dari pool dan tidak bisa mengirim request');
  if (poolCheck.status !== 'waiting') throw createError('invalid_pool_status', 400, `Hanya status waiting yang bisa apply. Status kamu saat ini: ${poolCheck.status}`);

  return teamRepo.createJoinRequest({ teamId, studentId, message });
}

async function respondJoinRequest({ requestId, poStudentId, response }) {
  const joinReq = await teamRepo.findJoinRequest(requestId);
  if (!joinReq) throw createError('request_not_found', 404, 'Request join tidak ditemukan');

  const team = await teamRepo.findTeamById(joinReq.team_id);
  if (team.po_student_id !== poStudentId) throw createError('forbidden', 403, 'Hanya PO yang berhak merespons');

  if (response === 'accepted') {
    const poolCheck = await poolRepo.findEntry(joinReq.requester_student_id, team.period);
    if (!poolCheck || poolCheck.status !== 'waiting') throw createError('invalid_pool_status', 400, 'Kandidat sudah tidak available (status bukan waiting)');

    const result = await prisma.$transaction(async (tx) => {
      await teamRepo.createMember(
        { teamId: team.id, studentId: joinReq.requester_student_id, studentName: poolCheck.student_name, programStudi: poolCheck.program_studi },
        tx
      );
      await poolRepo.updateStatus(joinReq.requester_student_id, team.period, 'in_team', tx);
      return teamRepo.updateJoinRequestStatus(requestId, 'accepted', tx);
    });

    publishToEventLog('TEAM_MEMBER_JOINED', {
      team_id: team.id,
      student_id: joinReq.requester_student_id,
      period: team.period,
      joined_via: 'join_request',
    }).catch((err) => console.error('[event-publisher] Failed to publish TEAM_MEMBER_JOINED:', err.message));

    recalculateTeamScores(team.id, team.period).catch((err) => console.error('[SCORING ERROR]', err));

    return result;
  }

  return teamRepo.updateJoinRequestStatus(requestId, 'rejected');
}

async function removeMember(teamId, targetStudentId, period) {
  const memberCheck = await prisma.teamMember.findFirst({
    where: { teamId, studentId: targetStudentId },
    orderBy: { joinedAt: 'desc' },
  });

  if (!memberCheck) throw createError('not_in_team', 404, 'User tidak ditemukan di riwayat tim ini');
  if (memberCheck.leftAt !== null) throw createError('already_left', 400, 'User tersebut sudah bukan anggota aktif di tim ini');

  await prisma.$transaction(async (tx) => {
    await teamRepo.setMemberLeft(teamId, targetStudentId, tx);
    await poolRepo.updateStatus(targetStudentId, period, 'waiting', tx);
  });

  publishToEventLog('TEAM_MEMBER_REMOVED', {
    team_id: teamId,
    student_id: targetStudentId,
    period,
  }).catch((err) => console.error('[event-publisher] Failed to publish TEAM_MEMBER_REMOVED:', err.message));

  recalculateTeamScores(teamId, period).catch((err) => console.error('[SCORING ERROR]', err));

  return { success: true };
}

module.exports = {
  getTeamById,
  getTeamByPoStudentId,
  getPoolEntryByStudentAndPeriod,
  getTeamList,
  getTeamListBySkill,
  getTeamDetail,
  getActiveTeamForMember,
  createTeam,
  inviteMemberToTeam,
  respondToInvite,
  updateRequiredSkills,
  createJoinRequest,
  respondJoinRequest,
  removeMember,
};

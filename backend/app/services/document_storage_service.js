const crypto = require("crypto");
const { validationError } = require("../core/api_error");
const {
  getSupabaseBucketName,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} = require("../core/supabase");

function createSafeFileName(fileName) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function buildStoragePath(teamId, fileName) {
  const uniquePrefix = crypto.randomUUID();
  return `documents/${teamId}/${uniquePrefix}-${createSafeFileName(fileName)}`;
}

async function uploadDocumentFile({ teamId, file }) {
  if (!file) {
    throw validationError("Field 'file' is required");
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  const bucketName = getSupabaseBucketName();
  const storagePath = buildStoragePath(teamId, file.originalname);

  const uploadResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucketName}/${storagePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": file.mimetype,
        "x-upsert": "false",
      },
      body: file.buffer,
    },
  );

  if (!uploadResponse.ok) {
    const uploadError = await uploadResponse.text();
    throw new Error(`Failed to upload file to Supabase Storage: ${uploadError}`);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${storagePath}`;

  return {
    fileUrl: publicUrl,
    storagePath,
  };
}

async function removeDocumentFile(storagePath) {
  if (!storagePath) {
    return;
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  const bucketName = getSupabaseBucketName();

  await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${storagePath}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
  });
}

module.exports = {
  uploadDocumentFile,
  removeDocumentFile,
};

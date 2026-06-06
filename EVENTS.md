# Event Documentation: Message Broker (RabbitMQ)

Dokumentasi ini merinci event-event yang dihasilkan oleh microservice Monitoring & Assessment (Kelompok 4) untuk dikonsumsi oleh service lain.

## ⚙️ Konfigurasi Broker
- **Exchange**: `tracker.events`
- **Exchange Type**: `topic`
- **RabbitMQ URL**: `amqp://guest:guest@localhost:5672` (Local Docker)

---

## 📡 Milestone Events
Event yang dipicu saat ada perubahan pada entitas Milestone.

### 1. Milestone Created
- **Routing Key**: `tracker.milestone.created`
- **Trigger**: Client membuat milestone baru yang ditautkan ke project dan talent yang sudah di-accept.
- **Payload Structure**:
```json
{
  "eventType": "milestone_created",
  "milestoneId": "uuid",
  "employerId": "uuid",
  "studentId": "uuid",
  "projectId": "string | null",
  "status": "open",
  "deadline": "ISO 8601 datetime",
  "occurredAt": "ISO 8601 datetime"
}
```

### 2. Milestone Updated
- **Routing Key**: `tracker.milestone.updated`
- **Trigger**: Client mengubah detail milestone yang sudah ada (misal: judul, deadline, status, atau payment amount).
- **Payload Structure**:
```json
{
  "eventType": "milestone_updated",
  "milestoneId": "uuid",
  "employerId": "uuid",
  "studentId": "uuid",
  "status": "open | in_progress | completed | cancelled",
  "deadline": "ISO 8601 datetime",
  "occurredAt": "ISO 8601 datetime"
}
```

---

## 📡 Submission Events
Event yang dipicu saat ada aktivitas pengumpulan atau penilaian dokumen dari talent.

### 3. Submission Posted
- **Routing Key**: `tracker.submission.posted`
- **Trigger**: Talent mengunggah dan mengumpulkan dokumen (file atau link) untuk sebuah milestone.
- **Payload Structure**:
```json
{
  "eventType": "submission_posted",
  "submissionId": "uuid",
  "milestoneId": "uuid",
  "employerId": "uuid",
  "studentId": "uuid",
  "status": "submitted",
  "deadline": "ISO 8601 datetime",
  "submittedAt": "ISO 8601 datetime",
  "occurredAt": "ISO 8601 datetime"
}
```

### 4. Submission Approved
- **Routing Key**: `tracker.submission.approved`
- **Trigger**: Client menyetujui dokumen yang dikumpulkan talent.
- **Payload Structure**:
```json
{
  "eventType": "submission_approved",
  "submissionId": "uuid",
  "milestoneId": "uuid",
  "studentId": "uuid",
  "reviewerId": "uuid",
  "reviewId": "uuid",
  "approvedBy": "uuid",
  "approvedAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime",
  "occurredAt": "ISO 8601 datetime"
}
```

### 5. Submission Rejected
- **Routing Key**: `tracker.submission.rejected`
- **Trigger**: Client menolak dokumen yang dikumpulkan talent karena tidak sesuai atau salah format.
- **Payload Structure**:
```json
{
  "eventType": "submission_rejected",
  "submissionId": "uuid",
  "milestoneId": "uuid",
  "studentId": "uuid",
  "reviewerId": "uuid",
  "reviewId": "uuid",
  "rejectedBy": "uuid",
  "rejectedAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime",
  "occurredAt": "ISO 8601 datetime"
}
```

### 6. Submission Needs Revision
- **Routing Key**: `tracker.submission.needs_revision`
- **Trigger**: Client mengembalikan dokumen kepada talent untuk diperbaiki.
- **Payload Structure**:
```json
{
  "eventType": "submission_needs_revision",
  "submissionId": "uuid",
  "milestoneId": "uuid",
  "studentId": "uuid",
  "reviewerId": "uuid",
  "reviewId": "uuid",
  "reviewedBy": "uuid",
  "reviewedAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime",
  "occurredAt": "ISO 8601 datetime"
}
```

---

## 📡 Project Completion & NFT Events
Event yang dipicu saat project dinyatakan selesai oleh client, mencakup pembuatan sertifikat PDF dan proses minting NFT ke blockchain.

### 7. Project Completed
- **Routing Key**: `tracker.project.completed`
- **Trigger**: Client memanggil `POST /tracker/projects/:projectId/complete` setelah semua milestone diselesaikan. K4 memproses pembuatan sertifikat PDF (disimpan ke MinIO), upload metadata ke IPFS via Pinata, dan minting NFT ERC-721 ke jaringan Base Sepolia.
- **Payload Structure**:
```json
{
  "eventType": "project_completed",
  "projectCompletionId": "uuid",
  "projectId": "string",
  "clientId": "uuid",
  "certificates": [
    {
      "certificateId": "uuid",
      "studentId": "uuid",
      "walletAddress": "0x...",
      "contractAddress": "0x...",
      "tokenId": "string",
      "txHash": "0x...",
      "metadataUri": "ipfs://...",
      "certificatePdfUrl": "https://...",
      "mintStatus": "minted | failed",
      "network": "base-sepolia"
    }
  ],
  "occurredAt": "ISO 8601 datetime"
}
```

> **Catatan**: Field `certificates` berisi array karena satu project dapat memiliki lebih dari satu talent (sesuai `kuota_maksimal` di K2). Setiap talent yang terlibat mendapat sertifikat dan NFT masing-masing. Untuk demo saat ini, NFT dikirim ke shared test wallet, bukan wallet talent per-user.

---

## 📋 Ringkasan Semua Events

| No | Event Type | Routing Key | Trigger |
|----|------------|-------------|---------|
| 1 | `milestone_created` | `tracker.milestone.created` | Client buat milestone baru |
| 2 | `milestone_updated` | `tracker.milestone.updated` | Client update milestone |
| 3 | `submission_posted` | `tracker.submission.posted` | Talent upload submission |
| 4 | `submission_approved` | `tracker.submission.approved` | Client approve submission |
| 5 | `submission_rejected` | `tracker.submission.rejected` | Client reject submission |
| 6 | `submission_needs_revision` | `tracker.submission.needs_revision` | Client minta revisi |
| 7 | `project_completed` | `tracker.project.completed` | Client complete project + NFT minted |

> **Catatan**: NFT endpoints (`GET /nft/team/:teamId` dan `GET /nft/:id/verify`) bersifat **read-only** dan tidak menghasilkan event ke message broker.
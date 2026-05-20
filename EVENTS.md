# Event Documentation: Message Broker (RabbitMQ)

Dokumentasi ini merinci event-event yang dihasilkan oleh microservice Monitoring & Assessment (Kelompok 4) untuk dikonsumsi oleh service lain.

## ⚙️ Konfigurasi Broker
- **Exchange**: `tracker.events`
- **Exchange Type**: `topic`
- **RabbitMQ URL**: `amqp://guest:guest@localhost:5672` (Local Docker)

## 📡 Milestone Events
Event yang dipicu saat ada perubahan pada entitas Milestone.

### 1. Milestone Created
- **Routing Key**: `tracker.milestone.created`
- **Trigger**: Dosen/Panitia membuat milestone baru.
- **Payload Structure**:
```json
{
  "eventType": "milestone_created",
  "milestoneId": "uuid",
  "employerId": "uuid",
  "studentId": "uuid",
  "status": "open",
  "deadline": "ISO 8601 datetime",
  "occurredAt": "ISO 8601 datetime"
}
```

### 2. Milestone Updated
- **Routing Key**: `tracker.milestone.updated`
- **Trigger**: Dosen/Panitia mengubah detail milestone yang sudah ada (misal: perpanjangan deadline).
- **Payload Structure**:
```json
{
  "eventType": "milestone_updated",
  "milestoneId": "uuid",
  "employerId": "uuid",
  "studentId": "uuid",
  "status": "open",
  "deadline": "ISO 8601 datetime",
  "occurredAt": "ISO 8601 datetime"
}
```

## 📡 Submission Events
Event yang dipicu saat ada aktivitas pengumpulan atau penilaian dokumen dari mahasiswa.

### 3. Submission Posted
- **Routing Key**: `tracker.submission.posted`
- **Trigger**: Mahasiswa mengunggah dan mengumpulkan dokumen untuk sebuah milestone.
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
- **Trigger**: Reviewer (Dosen/Panitia) menyetujui dokumen yang dikumpulkan mahasiswa.
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
- **Trigger**: Reviewer menolak dokumen yang dikumpulkan karena tidak sesuai atau salah format.
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
- **Trigger**: Reviewer mengembalikan dokumen kepada mahasiswa untuk diperbaiki (revisi).
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
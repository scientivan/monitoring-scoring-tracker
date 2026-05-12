CREATE UNIQUE INDEX idx_milestone_submissions_unique_milestone_student
  ON milestone_submissions(milestone_id, student_id);

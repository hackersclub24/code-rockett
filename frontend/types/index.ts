export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  intro: string | null;
  created_at: string;
};

export type ClassItem = {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_mins: number;
  meeting_link: string;
  course_id: string | null;
  course_name?: string | null;
  instructor_id: string | null;
  instructor_name?: string | null;
  max_capacity: number | null;
  status: string;
  created_at: string;
};

export type CourseItem = {
  id: string;
  name: string;
  description: string | null;
  level: string | null;
  is_active: boolean;
  created_at: string;
};

export type CourseEnrollmentStatus = {
  course_id: string;
  status: "pending" | "approved" | "rejected";
};

export type CourseEnrollmentRequest = {
  id: string;
  course_id: string;
  course_name: string;
  student_id: string;
  student_name: string;
  student_email: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  reviewed_at: string | null;
};

export type EnrolledCourse = {
  id: string;
  name: string;
  description: string | null;
  level: string | null;
  approved_at: string | null;
};

export type AssignmentOut = {
  id: string;
  title: string;
  description: string | null;
  class_id: string | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
};

export type StudentAssignment = {
  id: string;
  assignment_id: string;
  student_id: string;
  status: string;
  notes: string | null;
  updated_at: string;
  assignment?: {
    id: string;
    title: string;
    description: string | null;
    class_id: string | null;
    due_date: string | null;
    created_by: string;
    created_at: string;
  } | null;
};

export type EnrollmentStatus = {
  class_id: string;
  status: "pending" | "approved" | "rejected";
};

export type EnrollmentRequest = {
  id: string;
  class_id: string;
  class_title: string;
  student_id: string;
  student_name: string;
  student_email: string;
  status: "pending" | "approved" | "rejected";
  enrolled_at: string;
  reviewed_at: string | null;
};

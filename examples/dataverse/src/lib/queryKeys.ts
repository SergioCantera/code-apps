export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
    userPhoto: (userPrincipalName: string) => ['auth', 'photo', userPrincipalName] as const,
  },
  course: {
    all: ['courses'] as const,
    byId: (id: string) => ['courses', id] as const,
  },
  student: {
    all: ['students'] as const,
    byId: (id: string) => ['students', id] as const,

  },
  subject: {
    all: ['subjects'] as const,
    byId: (id: string) => ['subjects', id] as const,
    byMultipleIds: (studentId: string, ids: string[]) => ['subjects-by-student', studentId, ids.join(',')] as const,
  },
  student_subject: {
    all: ['student-subject-links'] as const,
    links: (studentId: string) => ['student-subject-links',"by-studentid", studentId] as const,
  }
}
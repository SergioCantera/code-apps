import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import type {Siero_students} from '@/generated/models/Siero_studentsModel'
import {Siero_studentsService} from '@/generated/services/Siero_studentsService'
import {
  getSubjectsByStudentId,
  useAddSubjectToStudent,
  useRemoveSubjectFromStudent,
} from '@/hooks/use-subject'
import {type StudentForm} from '@/pages/students'

export const useAllStudents = () => {
  const {data: students, isLoading: loadingStudents, error: errorStudents}= useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      // Simulate fetching students from an API or database
      const result = await Siero_studentsService.getAll();
      if (result.data){
        return result.data
      }
      return [];
    }
  })

  return {
    students,
    loadingStudents,
    errorStudents,
  }
}

export const useStudentById = (id: string) => {
  const {data: student, isLoading: loadingStudent, error: errorStudent}= useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      // Simulate fetching a single student by ID from an API or database
      const result = await Siero_studentsService.get(id);
      if (result.data){
        return result.data
      }
      return null;
    },
    enabled: !!id, // Only run this query if an ID is provided
  })

  return {
    student,
    loadingStudent,
    errorStudent,
  }
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({form}: {form: StudentForm}) => {
      const payload: Record<string, unknown> = {
        siero_firstname: form.firstName.trim(),
        siero_lastname: form.lastName.trim(),
        'siero_courseid@odata.bind': `/siero_courses(${form.courseid?.trim()})`
      }
      const result = await Siero_studentsService.create(
        payload as unknown as Omit<Siero_students, 'siero_studentid'>);
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the student data after a successful create
      queryClient.invalidateQueries({queryKey: ['students']});
    }
  })

  return mutation;
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({id, form}: {id: string, form: StudentForm}) => {
      // Simulate updating a student by ID in an API or database
      const updates: Record<string, unknown> = {
        siero_firstname: form.firstName.trim(),
        siero_lastname: form.lastName.trim(),
        'siero_courseid@odata.bind': `/siero_courses(${form.courseid?.trim()})`
      }
      const result = await Siero_studentsService.update(id, updates);
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the student data after a successful update
      queryClient.invalidateQueries({queryKey: ['students']});
    }
  })

  return mutation;
}

export const useSaveStudentWithSubjects = () => {
  const queryClient = useQueryClient()
  const updateStudentMutation = useUpdateStudent()
  const addSubjectToStudentMutation = useAddSubjectToStudent()
  const removeSubjectFromStudentMutation = useRemoveSubjectFromStudent()

  const mutation = useMutation({
    mutationFn: async ({id, form}: {id: string, form: StudentForm}) => {
      await updateStudentMutation.mutateAsync({ id, form })

      const persistedSubjects = await getSubjectsByStudentId(id)
      const persistedSubjectIds = new Set(
        persistedSubjects
          .map((subject) => subject.siero_subjectid)
          .filter((subjectId): subjectId is string => Boolean(subjectId))
      )
      const nextSubjectIds = new Set(
        form.subjects
          .map((subject) => subject.siero_subjectid)
          .filter((subjectId): subjectId is string => Boolean(subjectId))
      )

      const subjectIdsToAdd = [...nextSubjectIds].filter((subjectId) => !persistedSubjectIds.has(subjectId))
      const subjectIdsToRemove = [...persistedSubjectIds].filter((subjectId) => !nextSubjectIds.has(subjectId))

      if (subjectIdsToAdd.length > 0) {
        await Promise.all(
          subjectIdsToAdd.map((subjectId) =>
            addSubjectToStudentMutation.mutateAsync({
              studentId: id,
              subjectId,
            })
          )
        )
      }

      if (subjectIdsToRemove.length > 0) {
        await Promise.all(
          subjectIdsToRemove.map((subjectId) =>
            removeSubjectFromStudentMutation.mutateAsync({
              studentId: id,
              subjectId,
            })
          )
        )
      }

      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['students']})
    },
  })

  return mutation
}
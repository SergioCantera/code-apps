import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Siero_student_subjects } from '@/generated/models/Siero_student_subjectsModel'
import type { Siero_subjects } from '@/generated/models/Siero_subjectsModel'
import { Siero_subjectsService } from '@/generated/services/Siero_subjectsService'
import {  Siero_student_subjectsService } from '@/generated/services/Siero_student_subjectsService'
import {queryKeys} from '@/lib/queryKeys'


const getSubjectsByIds = async (subjectIds: string[]): Promise<Siero_subjects[]> => {
  if (subjectIds.length === 0) {
    return []
  }

  const responses = await Promise.all(
    subjectIds.map((subjectId) =>
      Siero_subjectsService.get(subjectId, {
        select: ['siero_subjectid', 'siero_name'],
      })
    )
  )

  return responses
    .map((response) => response.data)
    .filter((subject): subject is Siero_subjects => Boolean(subject))
}

export const getSubjectsByStudentId = async (studentId: string): Promise<Siero_subjects[]> => {
  const linkResult = await Siero_student_subjectsService.getAll({
    select: ['_siero_studentid_value', '_siero_subjectid_value', 'siero_name'],
    filter: `_siero_studentid_value eq ${studentId}`,
  })
  
  const subjectIds = [
    ...new Set(
      (linkResult.data ?? [])
        .map((link) => link._siero_subjectid_value)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  return getSubjectsByIds(subjectIds)
}

export const useAllSubjects = () => {
  const { data: subjects, isLoading: loadingSubjects, error: errorSubjects } = useQuery({
    queryKey: queryKeys.subject.all,
    queryFn: async () => {
      const result = await Siero_subjectsService.getAll()
      if (result.data) {
        return result.data
      }
      return []
    },
    staleTime: Infinity, // Subjects don't change often, so we can consider them always fresh
    gcTime: Infinity, // Keep subjects in cache indefinitely
    refetchOnWindowFocus: false, // Don't refetch subjects on window focus
    refetchOnReconnect: false, // Don't refetch subjects on reconnect
  })

  return {
    subjects,
    loadingSubjects,
    errorSubjects,
  }
}

export const useSubjectById = (subjectId: string | null) => {
  const { data: subject, isLoading: loadingSubject, error: errorSubject } = useQuery({
    queryKey: queryKeys.subject.byId(subjectId ?? ''),
    enabled: Boolean(subjectId),
    queryFn: async () => {
      if (!subjectId) return null

      const result = await Siero_subjectsService.get(subjectId)
      return result.data ?? null
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch links on window focus
  })

  return {
    subject,
    loadingSubject,
    errorSubject,
  }
}

export const useSubjectsByStudentId = (studentId: string | null) => {
  const {
    data: links,
    isLoading: loadingLinks,
    error: errorLinks,
  } = useQuery({
    queryKey: queryKeys.student_subject.links(studentId ?? ''),
    enabled: Boolean(studentId),
    queryFn: async () => {
      const result = await Siero_student_subjectsService.getAll({
        select: ['_siero_studentid_value', '_siero_subjectid_value', 'siero_name'],
        filter: `_siero_studentid_value eq ${studentId}`,
      })

      if (result.data) {
        return result.data
      }

      return []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch links on window focus
  })

  const subjectIds = useMemo(() => {
    const ids = (links ?? [])
      .map((link) => link._siero_subjectid_value)
      .filter((id): id is string => Boolean(id))

    return [...new Set(ids)]
  }, [links])

  const {
    data: subjects,
    isLoading: loadingSubjectsById,
    error: errorSubjectsById,
  } = useQuery({
    queryKey: queryKeys.subject.byMultipleIds(studentId ?? '', subjectIds),
    enabled: Boolean(studentId) && subjectIds.length > 0,
    queryFn: async () => getSubjectsByIds(subjectIds),
  })

  return {
    subjects: subjects ?? [],
    loadingSubjects: loadingLinks || loadingSubjectsById,
    errorSubjects: errorLinks ?? errorSubjectsById,
  }
}

export const useAddSubjectToStudent = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({studentId, subjectId}: {studentId: string, subjectId: string}) => {
      const payload: Record<string, unknown> = {
        'siero_StudentId@odata.bind': `/siero_students(${studentId.trim()})`,
        'siero_SubjectId@odata.bind': `/siero_subjects(${subjectId.trim()})`,
      }
        try {
          const result = await Siero_student_subjectsService.create(
            payload as unknown as Omit<Siero_student_subjects, 'siero_student_subjectid'>
          )
          return result.data
        } catch (error) {
          console.log('Error creating subject link: ', error)
        }
    },
    onSuccess: () => {
      // Invalidate and refetch the student data after a successful update
      queryClient.invalidateQueries({queryKey: queryKeys.student.all});
    }
  })

  return mutation;
}

export const useRemoveSubjectFromStudent = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({studentId, subjectId}: {studentId: string, subjectId: string}) => {
      // First, we need to find the link record that connects the student and subject
      const result = await Siero_student_subjectsService.getAll({
        filter: `_siero_studentid_value eq ${studentId} and _siero_subjectid_value eq ${subjectId}`
      });

      const linkRecord = result.data?.[0];
      if (!linkRecord || !linkRecord.siero_student_subjectid) {
        return;
      }

      // Now we can delete the link record
      await Siero_student_subjectsService.delete(linkRecord.siero_student_subjectid);
    },
    onSuccess: () => {
      // Invalidate and refetch the student data after a successful update
      queryClient.invalidateQueries({queryKey: queryKeys.student.all});
    }
  })

  return mutation;
}

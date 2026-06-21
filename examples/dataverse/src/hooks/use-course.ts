import {useQuery} from '@tanstack/react-query'
import {Siero_coursesService} from '@/generated/services/Siero_coursesService'
import {queryKeys} from '@/lib/queryKeys'

export const useAllCourses = () => {
  const {data: courses, isLoading: loadingCourses, error: errorCourses}= useQuery({
    queryKey: queryKeys.course.all,
    queryFn: async () => {
      // Simulate fetching courses from an API or database
      const result = await Siero_coursesService.getAll();
      if (result.data){
        return result.data
      }
      return [];
    },
    staleTime: Infinity, // Courses don't change often, so we can consider them always fresh
    gcTime: Infinity, // Keep courses in cache indefinitely
    refetchOnWindowFocus: false, // Don't refetch courses on window focus
    refetchOnReconnect: false, // Don't refetch courses on reconnect
  })

  return {
    courses,
    loadingCourses,
    errorCourses,
  }
}
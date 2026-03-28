import {useQuery} from '@tanstack/react-query'
import {Siero_coursesService} from '@/generated/services/Siero_coursesService'
//import {type Siero_students} from '@/generated/models/Siero_studentsModel'
//import type { IOperationResult } from '@microsoft/power-apps/data';
//import { useEffect, useState } from 'react';

{/*async function fetchLookup<T>(
  id: string | undefined,
  service: { get: (id: string, opts: any) => Promise<IOperationResult<T>> },
  selectFields: string[],
  nameExtractor: (data: T) => string,
  errorMessage: string
): Promise<string> {
  if (!id) return '';

  try {
    const result = await service.get(id, { select: selectFields });
    return result.data ? nameExtractor(result.data) : 'Unknown';
  } catch (err) {
    console.error(errorMessage, err);
    return 'Error loading';
  }
}*/}

export const useAllCourses = () => {
  const {data: courses, isLoading: loadingCourses, error: errorCourses}= useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      // Simulate fetching courses from an API or database
      const result = await Siero_coursesService.getAll();
      if (result.data){
        return result.data
      }
      return [];
    }
  })

  return {
    courses,
    loadingCourses,
    errorCourses,
  }
}
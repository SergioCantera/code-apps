import {useQuery} from '@tanstack/react-query'
import { getContext } from '@microsoft/power-apps/app'
import {Office365UsersService} from '@/generated/services/Office365UsersService'
import {queryKeys} from '@/lib/queryKeys'

export const useAuthQuery = () => {
  const {data: user, isLoading: loadingUser, error: errorUser}= useQuery({
      queryKey: queryKeys.auth.me,
      queryFn: async () => {
        const result = await getContext()
        if (result.user){
          return result.user
        }
        return null;
      },
      staleTime: Infinity, // Courses don't change often, so we can consider them always fresh
      gcTime: Infinity, // Keep courses in cache indefinitely
      refetchOnWindowFocus: false, // Don't refetch courses on window focus
      refetchOnReconnect: false, // Don't refetch courses on reconnect
    })
  
    return {
      user,
      loadingUser,
      errorUser,
    }
}

export const useUserPhotoQuery = (userPrincipalName?: string) => {
  const {data: userPhoto, isLoading: loadingUserPhoto, error: errorUserPhoto}= useQuery({
      queryKey: queryKeys.auth.userPhoto(userPrincipalName || ''),
      queryFn: async () => {
        if (!userPrincipalName) return null;
        let photoData = null;
        try {
          photoData = (await Office365UsersService.UserPhoto_V2(userPrincipalName)).data
          if (photoData) {
            return (`data:image/jpeg;base64,${photoData}`)
          }
        } catch (error) {
          console.error('Error fetching user photo:', error)
          return null
        }
      },
      enabled: !!userPrincipalName, // Only run this query if we have a userPrincipalName
      staleTime: Infinity, // User photos don't change often, so we can consider them always fresh
      gcTime: Infinity, // Keep user photos in cache indefinitely
      refetchOnWindowFocus: false, // Don't refetch user photos on window focus
      refetchOnReconnect: false, // Don't refetch user photos on reconnect
    })
  
    return {
      userPhoto,
      loadingUserPhoto,
      errorUserPhoto,
    }
}
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {Button} from "@/components/ui/button";
import {useAuthQuery, useUserPhotoQuery} from "@/hooks/use-auth";
import {type IContext} from '@microsoft/power-apps/app';

type IUserProps = Pick<IContext['user'], 'fullName' | 'userPrincipalName' | 'tenantId' | 'objectId'>

const LOGGED_USER = {
  fullName: "John Doe",
  userPrincipalName: "john.doe@example.com",
  tenantId: "12345678-90ab-cdef-1234-567890abcdef",
  objectId: "abcdef12-3456-7890-abcd-ef1234567890",
  imageUrl: "https://testingbot.com/free-online-tools/random-avatar/300"
}

export function LoggedUser() {

  const {user} = useAuthQuery()
  const {userPhoto} = useUserPhotoQuery(user?.userPrincipalName || user?.objectId || '')
  const loggedUser: IUserProps & { userPhoto?: string } = user ? {...user, userPhoto: userPhoto ?? undefined} : {...LOGGED_USER}

  const userInitials = (loggedUser.fullName || '')
    .split(' ')
    .map((name: string) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return(
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' data-testid="button-user-profile">
          <Avatar size="sm">
            <AvatarImage src={loggedUser.userPhoto} alt={loggedUser.fullName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className="w-64 p-2">
        <div className='flex items-center gap-3 rounded-md p-2'>
          <Avatar size="lg">
            <AvatarImage src={loggedUser.userPhoto} alt={loggedUser.fullName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className='truncate text-sm font-medium'>{loggedUser.fullName}</p>
            <p className='truncate text-xs text-muted-foreground'>{loggedUser.userPrincipalName}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          Logged user profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
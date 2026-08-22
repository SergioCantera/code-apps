import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {Button} from "@/components/ui/button"

const LOGGED_USER = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  imageUrl: "https://testingbot.com/free-online-tools/random-avatar/300"
}

export function LoggedUser() {

  const userInitials = LOGGED_USER.fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return(
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' data-testid="button-user-profile">
          <Avatar size="sm">
            <AvatarImage src={LOGGED_USER.imageUrl} alt={LOGGED_USER.fullName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className="w-64 p-2">
        <div className='flex items-center gap-3 rounded-md p-2'>
          <Avatar size="lg">
            <AvatarImage src={LOGGED_USER.imageUrl} alt={LOGGED_USER.fullName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className='truncate text-sm font-medium'>{LOGGED_USER.fullName}</p>
            <p className='truncate text-xs text-muted-foreground'>{LOGGED_USER.email}</p>
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
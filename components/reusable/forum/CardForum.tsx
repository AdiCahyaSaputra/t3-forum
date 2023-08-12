import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertOctagon, Forward, MessagesSquare } from 'lucide-react'
import { useRouter } from 'next/router'
import React from 'react'

type TProps = {
  id: string,
  content: string,
  createdAt: string,
  User?: {
    name: string
    username: string,
    image: string | null,
    id: string
  } | null,
  Anonymous?: {
    username: string
    id: string
  } | null
}

const CardForum: React.FC<TProps> = ({ id, content, User, createdAt, Anonymous }) => {

  const router = useRouter()

  const getMeta = (createdAt: string) => {
    const formattedDate = new Date(createdAt)
      .toLocaleString('id')
      .replaceAll('/', '-')
      .replaceAll('.', ':')
      .split('')

    formattedDate.splice(-3, 3)

    return formattedDate.join('')
  }

  return (
    <Card>
      <CardHeader className='px-4 py-2'>

        <CardTitle onClick={() => {
          if (!Anonymous) router.push('/profil/' + User?.username)
        }} className={`${Anonymous ? 'cursor-default' : 'cursor-pointer'} flex items-center gap-4`}>

          <Avatar>
            <AvatarImage src={User?.image ?? ''} alt="@shadcn" />
            <AvatarFallback>{User ? User.username[0].toUpperCase() : Anonymous ? Anonymous.username[3].toUpperCase() : 'K'}</AvatarFallback>
          </Avatar>
          <div>
            <p className='font-bold text-base'>{User ? User.name : 'Anonymous'}</p>
            <p className='text-foreground/60 text-base'>{User ? User.username : Anonymous ? Anonymous.username : 'si-eek'}</p>
          </div>

        </CardTitle>

        <CardDescription className='pt-2'>
          Dibuat {getMeta(createdAt)}
        </CardDescription>

      </CardHeader>
      <CardContent className='px-4 py-2'>
        <p>{content}</p>
      </CardContent>
      <Separator />
      <CardFooter className='p-2 space-x-2'>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='outline'>
                <MessagesSquare className='w-5 aspect-square' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Komentar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='outline'>
                <Forward className='w-5 aspect-square' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bagikan</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='destructive'>
                <AlertOctagon className='w-5 aspect-square' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lapor Pedo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </CardFooter>
    </Card>
  )
}

export default CardForum

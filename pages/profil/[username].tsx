import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { trpc } from '@/utils/trpc'
import { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import React, { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import CardForum from '@/components/reusable/forum/CardForum'
import { TUser, getAuthUser } from '@/lib/utils'
import Layout from '@/components/section/Layout'
import SubMenuHeader from '@/components/reusable/menu/SubMenuHeader'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/trpc'
import superjson from 'superjson'
import { Skeleton } from '@/components/ui/skeleton'
import Loading from '@/components/reusable/skeleton/Loading'
import Empty from '@/components/reusable/skeleton/Empty'
import SeeProfilePict from '@/components/reusable/profil/SeeProfilePict'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { username } = ctx.query
  const user = await getAuthUser(ctx.req.cookies?.token!)

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  // Prefetch the data
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson
  })

  await helpers.user.profile.prefetch({ username: username as string })
  await helpers.post.user.prefetch({ username: username as string })

  return {
    props: {
      username,
      user,
      trpcState: helpers.dehydrate()
    }
  }
}

type TProps = {
  username: string,
  user: TUser
}

const UserDataSkeleton: React.FC = () => {
  return (
    <div className='flex flex-col items-start'>
      <Skeleton className='w-24 h-6 rounded-md' />
      <Skeleton className='w-12 h-6 mt-2 rounded-md' />
    </div>
  )
}

const ProfileDetail: NextPage<TProps> = ({ username, user }) => {

  const { data: userResponse } = trpc.user.profile.useQuery({ username })
  const { data: postResponse } = trpc.post.user.useQuery({ username })

  const [seeProfilePict, setSeeProfilePict] = useState(false)

  return (
    <>
      <Head>
        <title>Profil Lo</title>
      </Head>
      <Layout user={user}>
        <main className='bg-background text-foreground selection:bg-foreground selection:text-background pb-10'>
          
          <SeeProfilePict  
            {...{ 
              setSeeProfilePict, 
              seeProfilePict,
              image: userResponse?.data?.image || ''
            }} 
          />

          <SubMenuHeader backUrl='/forum' title='Profil' data={userResponse?.data?.username || null} />

          <div className='container'>
            <div className='flex items-start gap-4 py-4'>
              {/** Preview Image */}
              <Avatar className='cursor-pointer w-14 h-14 rounded-md'>
                <AvatarImage onClick={() => setSeeProfilePict(true)} src={(userResponse?.data?.image || null) ?? ''} alt="@shadcn" />
                <AvatarFallback>{`${userResponse?.data?.username[0] || ''}`.toUpperCase()}</AvatarFallback>
              </Avatar>
              <Loading data={userResponse?.data} skeletonFallback={<UserDataSkeleton />}>
                <div>
                  <h2 className='text-lg font-bold'>{userResponse?.data?.name}</h2>
                  <p>{userResponse?.data?.username}</p>
                </div>
              </Loading>
            </div>

            <Separator />

            <div className='mt-2'>
              <h2 className='text-lg font-bold'>Bio</h2>
              <Loading data={userResponse?.data} skeletonFallback={<Skeleton className='mt-2 w-24 h-4 rounded-md' />}>
                <p className={`mt-2 ${userResponse?.data?.bio ? '' : 'text-foreground/60'}`}>{userResponse?.data?.bio || 'Kosong'}</p>
              </Loading>
            </div>

            <div className='mt-2'>
              <h2 className='text-lg font-bold'>Postingan</h2>

              <ul className='py-2 space-y-4'>
                <Loading data={postResponse?.data} skeletonFallback={<Skeleton className='w-full h-12 rounded-md' />}>
                  <Empty data={postResponse?.data} emptyFallback={
                    <li className='text-foreground/60'>
                      Kosong
                    </li>
                  }>
                    {postResponse?.data?.map((post, idx) => (
                      <li key={idx}>
                        <CardForum {...post} />
                      </li>
                    ))}
                  </Empty>
                </Loading>
              </ul>
            </div>

          </div>

        </main>
      </Layout>
    </>
  )
}

export default ProfileDetail

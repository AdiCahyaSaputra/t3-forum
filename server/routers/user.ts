import { apiResponse, excludeFields } from '@/lib/utils'
import { procedure, router } from '@/server/trpc'
import { z } from 'zod'

export const userRouter = router({
  profile: procedure
    .input(z.object({
      username: z.string(),
      id: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      const { username, id } = input
      const userExist = await ctx.prisma.user.findUnique({
        where: id ? { id } : { username },
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
          image: true,
        }
      })

      if (!userExist) return apiResponse({
        status: 404,
        message: 'Profil lu ilang bre!'
      })

      return apiResponse({
        status: 200,
        message: 'Ada nih'
      }, userExist)
    }),
  editAccount: procedure
    .input(z.object({
      name: z.string(),
      username: z.string().min(3).trim().toLowerCase(),
      bio: z.string().max(100).nullable(),
      image: z.string().nullable(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { username } = input
      const updatedUser = await ctx.prisma.user.update({
        data: { ...input },
        where: { username }
      })

      if (!updatedUser) return apiResponse({
        status: 400,
        message: 'Aduh lagi gk bisa ngedit user bre'
      })

      return apiResponse({
        status: 200,
        message: 'Udah kelar di edit nih user nya'
      })
    })
})

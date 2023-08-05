import { apiResponse, generateRandomStr } from "@/lib/utils"
import { procedure, router } from "@/server/trpc"
import { z } from 'zod'

export const postRouter = router({
  all: procedure
    .query(async ({ ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        select: {
          id: true,
          content: true,
          createdAt: true,
          User: {
            select: {
              name: true,
              username: true,
              id: true
            }
          },
          Anonymous: {
            select: {
              username: true,
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (!posts.length) return apiResponse({
        status: 404,
        message: 'Belum ada postingan sama sekali bre'
      })

      return apiResponse({
        status: 200,
        message: 'Semua postingan'
      }, posts)
    }),
  byId: procedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const postId = input

      const existingPost = await ctx.prisma.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          User: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          Anonymous: {
            select: {
              id: true,
              username: true
            }
          }
        }
      })

      if (!existingPost) return apiResponse({
        status: 404,
        message: 'Postingan gk ada'
      })

      return apiResponse({
        status: 200,
        message: 'Postingan ada ni'
      }, existingPost)
    }),
  store: procedure
    .input(z.object({
      content: z.string().min(3).max(255),
      userId: z.string(),
      isAnonymPost: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { content, userId, isAnonymPost } = input

      // Create Post anonymous-ly
      if (isAnonymPost) {
        const anonymousUserExist = await ctx.prisma.anonymous.findUnique({
          where: {
            userId
          }
        })

        if (!anonymousUserExist) {
          const createdAnonymousPost = await ctx.prisma.anonymous.create({
            data: {
              userId,
              username: 'si-' + generateRandomStr(4),
              Post: {
                create: { content }
              }
            },
          })

          if (!createdAnonymousPost) return apiResponse({
            status: 400,
            message: 'Gagal membuat postingan anonym bre :('
          })

          return apiResponse({
            status: 201,
            message: 'Berhasil membuat postingan anonym!'
          }, createdAnonymousPost)
        }

        const createdAnonymousPost = await ctx.prisma.post.create({
          data: {
            anonymousId: anonymousUserExist.id,
            content,
          }
        })

        if (!createdAnonymousPost) return apiResponse({
          status: 400,
          message: 'Gagal membuat postingan anonym bre :('
        })

        return apiResponse({
          status: 201,
          message: 'Berhasil membuat postingan anonym!'
        }, createdAnonymousPost)
      }

      // Create Post Publically
      const createdPost = await ctx.prisma.post.create({
        data: {
          content, userId
        }
      })

      if (!createdPost) return apiResponse({
        status: 400,
        message: 'Postingan lu gk bisa di buat sekarang bre'
      })

      return apiResponse({
        status: 201,
        message: 'Postingan lu berhasil gua buat'
      }, createdPost)
    }),
  user: procedure
    .input(z.object({
      username: z.string(),
      includeAnonymous: z.boolean().default(false),
    }))
    .query(async ({ input, ctx }) => {
      const { username, includeAnonymous } = input

      const existingPost = await ctx.prisma.post.findMany({
        where: {
          User: { username },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          User: {
            select: {
              name: true,
              username: true,
              id: true
            }
          },
        }
      })

      const data = []

      if (!existingPost) return apiResponse({
        status: 404,
        message: 'Orang ini belom bikin postingan'
      })

      if (includeAnonymous) {
        const existingAnonymousPost = await ctx.prisma.post.findMany({
          where: {
            Anonymous: {
              userId: existingPost[0].User?.id
            }
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            Anonymous: {
              select: {
                username: true,
                id: true
              }
            },
          }
        })

        if (!existingAnonymousPost) return apiResponse({
          status: 404,
          message: 'Orang ini belom bikin postingan'
        })

        data.push(...existingAnonymousPost)
      }

      data.push(...existingPost)

      return apiResponse({
        status: 200,
        message: 'Ada ni bre'
      }, data)
    }),
  edit: procedure
    .input(z.object({
      content: z.string().min(3).max(255),
      userId: z.string().nullable(),
      postId: z.string(),
      isAnonymPost: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      const { content, userId, postId, isAnonymPost } = input

      // Jika pengen switch ke mode anonym
      if (isAnonymPost) {
        const anonymousPost = await ctx.prisma.post.findUnique({
          where: {
            id: postId
          }
        })

        // Kita cek apakah post tersebut udah anonym apa belom
        if (anonymousPost && !anonymousPost.anonymousId && anonymousPost.userId) { // Jika Belum anonym

          // Jika udah punya akun anonym
          let existingAnonymousUser = await ctx.prisma.anonymous.findUnique({
            where: {
              userId: anonymousPost.userId
            }
          })

          // Jika belom punya akun anonym
          if (!existingAnonymousUser) {
            const createdAnonymousUser = await ctx.prisma.anonymous.create({
              data: {
                userId: anonymousPost?.userId,
                username: 'si-' + generateRandomStr(4),
              },
            })

            if (!createdAnonymousUser) return apiResponse({
              status: 400,
              message: 'Gagal update postingan anonym bre :('
            })

            existingAnonymousUser = createdAnonymousUser
          }

          const updatedAnonymousPost = await ctx.prisma.post.update({
            where: { id: postId },
            data: {
              userId: null,
              anonymousId: existingAnonymousUser?.id,
              content,
            }
          })

          if (!updatedAnonymousPost) return apiResponse({
            status: 400,
            message: 'Gagal update postingan anonym bre :('
          })

          return apiResponse({
            status: 201,
            message: 'Berhasil meng-update postingan anonym!'
          }, updatedAnonymousPost)
        }

        // Jika sudah anonym
        const updatedAnonymousPost = await ctx.prisma.post.update({
          where: { id: postId },
          data: {
            userId: null,
            anonymousId: anonymousPost?.anonymousId,
            content,
          }
        })

        if (!updatedAnonymousPost) return apiResponse({
          status: 400,
          message: 'Gagal update postingan anonym bre :('
        })

        return apiResponse({
          status: 201,
          message: 'Berhasil meng-update postingan anonym!'
        }, updatedAnonymousPost)
      }

      // Update Post Publically
      let updatedPost = null

      // Jika userId nya gk null
      if (userId) {
        updatedPost = await ctx.prisma.post.update({
          where: { id: postId },
          data: {
            userId: userId,
            anonymousId: null, // Buat pastiin bakal jadi post public
            content
          }
        })
      }

      // Jika userId nya null
      if (!userId) {
        const existingAnonymousPost = await ctx.prisma.post.findUnique({
          where: { id: postId },
          select: {
            Anonymous: {
              select: { userId: true }
            }
          }
        })

        if (!existingAnonymousPost) return apiResponse({
          status: 400,
          message: 'Gagal update postingan anonym bre :('
        })

        updatedPost = await ctx.prisma.post.update({
          where: { id: postId },
          data: {
            userId: existingAnonymousPost.Anonymous?.userId,
            anonymousId: null, // Buat pastiin bakal jadi post public
            content
          }
        })
      }

      if (!updatedPost) return apiResponse({
        status: 400,
        message: 'Postingan lu gk bisa di update sekarang bre'
      })

      return apiResponse({
        status: 201,
        message: 'Postingan lu berhasil gua update'
      }, updatedPost)
    })
})

import React from 'react'
import { Textarea } from '../ui/textarea'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { trpc } from '@/utils/trpc'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

type TProps = {
  userId: string,
  openCreatePostInput: boolean,
  setOpenCreatePostInput: (value: React.SetStateAction<boolean>) => void
}

const formSchema = z.object({
  content: z.string().min(3).max(255),
  userId: z.string(),
})

const CreatePostSection: React.FC<TProps> = ({ openCreatePostInput, setOpenCreatePostInput, userId }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      userId
    }
  })

  const { isLoading, mutate: createPost, error, data } = trpc.post.store.useMutation()
  const activeAlert = data || error

  function submitHandler(values: z.infer<typeof formSchema>) {
    createPost(values, {
      onSuccess: (data) => {
        console.log(data.data)
      }
    })
  }

  return (
    <div className={`fixed inset-0 z-20 transition-all bg-secondary/40 backdrop-blur-md flex flex-col justify-center items-center ${openCreatePostInput ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className='w-10/12 lg:w-max space-y-4'>
        {activeAlert && (
          <Alert>
            <AlertTitle>Notfikasi</AlertTitle>
            <AlertDescription>
              {error ? error.message.split(' ').slice(0, 5).join(' ') : data?.message}
            </AlertDescription>
          </Alert>
        )}

        <div className='p-4 bg-white w-full border-2 rounded-md'>

          <h1 className='text-2xl flex justify-between items-center font-bold'>
            <span>Buat Postingan</span>
            <span className='text-md'>🚀</span>
          </h1>

          <Separator className='my-4' />

          <div className="grid w-full gap-1.5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Tulis isi postingan disini" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='space-x-2 mt-4'>
                  <Button type='submit' disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Tunggu Bre
                      </>
                    ) : "Buat Postingan"}
                  </Button>
                  <Button type='button' variant='outline' onClick={() => setOpenCreatePostInput(false)}>
                    Gak Jadi Deh
                  </Button>
                </div>
              </form>
            </Form>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CreatePostSection

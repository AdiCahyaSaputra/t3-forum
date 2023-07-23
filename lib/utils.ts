import { User } from "@prisma/client"
import { type ClassValue, clsx } from "clsx"
import { getCookie } from "cookies-next"
import { jwtVerify } from "jose"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function excludeFields<Model, Key extends keyof Model>(model: Model, keys: Key[]) {
  // @ts-ignore
  return Object.fromEntries(Object.entries(model).filter(([key]) => !keys.includes(key)))
}

type TResponse = {
  status: number,
  message: string
}

export function apiResponse<T = void>(response: TResponse, data?: T) {
  return {
    ...response,
    data
  }
}

const JWT_SECRET: string | undefined = process.env.JWT_SECRET!

export function getJwtSecret(): string {
  if (!JWT_SECRET || JWT_SECRET.length === 0) {
    throw new Error('The environment variable JWT_SECRET is not set.')
  }

  return JWT_SECRET
}

export const getAuthUser = async (token: string) => {
  const payload = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()))
    .then(decoded => decoded.payload as User)
    .catch(err => null)

  if (payload) {
    return {
      id: payload.id,
      username: payload.username,
      name: payload.name,
      image: payload.image,
      bio: payload.bio
    }
  }

  return null
}

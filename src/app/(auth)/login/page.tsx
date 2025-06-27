'use client'

import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RevaLogo from "@/components/reva-logo"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto grid w-full max-w-sm gap-6">
      <div className="grid gap-4 text-center">
        <div className="mx-auto">
            <RevaLogo size="md" />
        </div>
        <h1 className="font-headline text-3xl">Welcome Back</h1>
        <p className="text-balance text-muted-foreground">
          Enter your email and password to access your account
        </p>
      </div>
      <form className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="#"
              className="ml-auto inline-block text-sm underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" required />
            <Button variant="ghost" size="icon" type="button" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="remember-me" />
          <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground">Remember me</Label>
        </div>
        <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90" asChild>
          <Link href="/chat">Sign In</Link>
        </Button>
        <Button variant="outline" className="w-full">
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 25.5 169.3 65.5l-69.2 69.2c-20.3-19.3-46.1-31-75.1-31-57.2 0-104 46.8-104 104s46.8 104 104 104c63.9 0 94.9-50.4 98.7-74.9H248v-96h240c2.6 14.1 4 29.3 4 44.8z"></path></svg>
          Sign In with Google
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline">
          Sign Up
        </Link>
      </div>
    </div>
  )
}

'use client'

import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RevaLogo from "@/components/reva-logo"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="mx-auto grid w-full max-w-sm gap-6">
      <div className="grid gap-4 text-center">
        <div className="mx-auto">
            <RevaLogo size="md" />
        </div>
        <h1 className="font-headline text-3xl">Create an Account</h1>
        <p className="text-balance text-muted-foreground">
          Enter your details below to get started
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
            <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" required />
            <Button variant="ghost" size="icon" type="button" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" required />
            <Button variant="ghost" size="icon" type="button" className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
            </Button>
          </div>
        </div>
        <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90">
          Sign Up
        </Button>
        <Button variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 25.5 169.3 65.5l-69.2 69.2c-20.3-19.3-46.1-31-75.1-31-57.2 0-104 46.8-104 104s46.8 104 104 104c63.9 0 94.9-50.4 98.7-74.9H248v-96h240c2.6 14.1 4 29.3 4 44.8z"></path></svg>
          Sign Up with Google
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign In
        </Link>
      </div>
    </div>
  )
}

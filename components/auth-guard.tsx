"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const { toast } = useToast()

  // Get current password from localStorage or use default
  const getCurrentPassword = () => {
    return localStorage.getItem("social-generator-password") || "truthvibe2024"
  }

  useEffect(() => {
    const authStatus = localStorage.getItem("social-generator-auth")
    if (authStatus === "authenticated") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const currentPassword = getCurrentPassword()

    if (password === currentPassword) {
      localStorage.setItem("social-generator-auth", "authenticated")
      setIsAuthenticated(true)
      toast({
        title: "Welcome!",
        description: "Successfully logged in to Social Media Post Generator",
      })
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    // Save new password
    localStorage.setItem("social-generator-password", newPassword)
    setShowPasswordChange(false)
    setNewPassword("")

    toast({
      title: "Password Changed!",
      description: "Your password has been updated successfully",
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("social-generator-auth")
    setIsAuthenticated(false)
    setPassword("")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Required</CardTitle>
            <CardDescription>Enter the password to access the Social Media Post Generator</CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordChange ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Authenticating..." : "Access Generator"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => setShowPasswordChange(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordChange(false)
                      setNewPassword("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="absolute top-4 right-4 z-10">
        <Button variant="outline" onClick={handleLogout} size="sm">
          Logout
        </Button>
      </div>
      {children}
    </div>
  )
}

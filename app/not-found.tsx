import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Post Not Found</CardTitle>
          <CardDescription>The social media post you're looking for doesn't exist or has been removed.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Generator
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

export default function SetupInstructions() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Setup Instructions
          </CardTitle>
          <CardDescription>Follow these steps to configure your Social Media Post Generator</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Supabase Setup */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Badge variant="outline">1</Badge>
              Supabase Database Setup
            </h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Project URL:</strong> https://wmizvklxfdxmwuocnadq.supabase.co
              </p>
              <p className="text-sm">
                <strong>Status:</strong> <span className="text-green-600">✓ Configured</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Run the SQL script in your Supabase SQL editor to create tables</span>
              </div>
            </div>
          </div>

          {/* Cloudinary Setup */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Badge variant="outline">2</Badge>
              Cloudinary Media Upload Setup
            </h3>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Cloud Name:</strong> dmq5lbyso
              </p>
              <p className="text-sm">
                <strong>Upload Preset:</strong> social-media-24
              </p>
              <p className="text-sm">
                <strong>Status:</strong> <span className="text-green-600">✓ Configured & Ready</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700">
                  Upload preset "social-media-24" is configured and ready for use
                </span>
              </div>
              <a
                href="https://console.cloudinary.com/settings/upload"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                View Cloudinary Settings <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Upload Preset Confirmation */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Badge variant="outline">3</Badge>
              Upload Preset Configuration
            </h3>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">Upload Preset Ready</span>
              </div>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Preset Name:</strong>{" "}
                  <code className="bg-background px-1 rounded font-mono">social-media-24</code>
                </p>
                <p>
                  <strong>Mode:</strong> Unsigned (for client-side uploads)
                </p>
                <p>
                  <strong>Supported Formats:</strong> Images (jpg, png, gif) & Videos (mp4, webm, mov)
                </p>
                <p>
                  <strong>File Size Limits:</strong> Media files up to 100MB, Thumbnails up to 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Testing */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Badge variant="outline">4</Badge>
              Test Your Setup
            </h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">Your setup is complete! Test the tool by:</p>
              <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Creating a sample post with title and description</li>
                <li>Uploading a test image or video (check file size limits)</li>
                <li>Adding a redirect link or popunder ad code</li>
                <li>Generating and visiting the post link</li>
                <li>Testing like, comment, and share functionality</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

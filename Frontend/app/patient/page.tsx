"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, CheckCircle, Upload } from "lucide-react"
import Link from "next/link"

export default function PatientPage() {
  const [otp, setOtp] = useState("")
  const [copied, setCopied] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")

  useEffect(() => {
    const storedOtp = window.localStorage.getItem("otp");
    window.localStorage.removeItem("otp");

    if (storedOtp)
      setOtp(storedOtp);
    else
      window.location.href = '/';
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(otp)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  }

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus("");

    const formData = new FormData();
    formData.append("file", file);

    let token = localStorage.getItem("token");
    if (!token) window.location.href = "/";

    try {
      const response = await fetch("http://localhost:5000/api/v1/patient/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("File uploaded successfully!");
        setFile(null);
      } else {
        setUploadStatus("Failed to upload file.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-100 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-red-700 text-2xl">Your Secure OTP</CardTitle>
          <CardDescription>Share this OTP with your doctor to establish a secure connection</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="bg-red-50 w-full py-8 rounded-lg mb-6 flex justify-center">
            <div className="flex space-x-2">
              {otp.split("").map((digit, index) => (
                <div
                  key={index}
                  className="w-12 h-16 bg-white rounded-md border border-red-200 flex items-center justify-center text-2xl font-bold text-red-700 shadow-sm"
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full mb-6 space-y-2">
            <div className="relative w-full">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <Button
                type="button"
                className="w-full bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 relative z-0"
              >
                {file ? file.name : "Choose File"}
              </Button>
            </div>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
              onClick={handleUpload}
              disabled={uploading || !file}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
            {uploadStatus && <p className="text-sm text-gray-600 mt-2 text-center">{uploadStatus}</p>}
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md w-full">
            <p className="font-medium mb-2">Important:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>This OTP is valid for the current session only</li>
              <li>Share this code with your doctor to begin the consultation</li>
              <li>Do not share this code with anyone else</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy OTP
              </>
            )}
          </Button>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

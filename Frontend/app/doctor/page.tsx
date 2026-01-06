"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCog, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DoctorPage() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/v1/doctor/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: parseInt(otp, 10) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Invalid OTP");
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      router.push("/chat");
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error(error);
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-100 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <UserCog className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-red-700 text-2xl">Doctor Verification</CardTitle>
          <CardDescription>Enter the OTP provided by your patient</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-gray-700">
                  Patient OTP
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit OTP"
                    className="pl-10 border-red-200 focus:border-red-500 focus:ring-red-500"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500 bg-red-50 p-3 rounded-md">
                <p className="font-medium text-red-700 mb-1">What happens next?</p>
                <p>
                  After entering the correct OTP, you will be connected to your patient's secure chat interface where
                  you can:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Access their medical files</li>
                  <li>Communicate securely</li>
                  <li>Provide medical advice</li>
                </ul>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={handleSubmit}
            disabled={otp.length !== 6 || isLoading}
          >
            {isLoading ? "Verifying..." : "Connect to Patient"}
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

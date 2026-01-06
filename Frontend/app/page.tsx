"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRound, UserCog } from "lucide-react"

declare global {
  interface Window {
    google: any
  }
}

export default function LandingPage() {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [])

  const handleGoogleSignIn = () => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: "1080728460259-9l8b9evld5915bck8b5f81ruvt02tjg1.apps.googleusercontent.com",
      scope: "profile email",
      callback: async (tokenResponse: any) => {
        console.log("Access token:", tokenResponse.access_token)
        let googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        let profile = await googleRes.json();
        console.log(profile);

        let name = profile.name;
        let picture = profile.picture;
        let email = profile.email;

        let body = {
          name: name,
          picture: picture,
          email: email,
        };

        let res = await fetch("http://localhost:5000/api/v1/patient/generate-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body)
        });

        let userData = await res.json();

        window.localStorage.setItem("otp", userData.otp);
        window.localStorage.setItem("token", userData.access_token);

        window.location.href = "/patient";
      },
    })

    tokenClient.requestAccessToken()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center mb-8">
        <h1 className="text-3xl font-bold text-red-700 mb-2">MediConnect</h1>
        <p className="text-gray-600">Secure doctor-patient communication platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Card className="border-red-100 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
              <UserRound className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-700">Patient Login</CardTitle>
            <CardDescription>Login as a patient to connect with your doctor</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-500">
            Generate a unique OTP code that your doctor can use to connect with you
          </CardContent>
          <CardFooter>
            <Button onClick={handleGoogleSignIn} className="w-full bg-red-600 hover:bg-red-700">
              Login with Google
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-red-100 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
              <UserCog className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-700">Doctor Login</CardTitle>
            <CardDescription>Login as a doctor to connect with your patients</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-500">
            Enter the patient's OTP code to access their medical files and chat
          </CardContent>
          <CardFooter>
            <a href="/doctor" className="w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700">Login as Doctor</Button>
            </a>
          </CardFooter>
        </Card>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>MediConnect.</p>
        <p className="mt-1">Created by TY IT-A G14</p>
      </footer>
    </div>
  )
}

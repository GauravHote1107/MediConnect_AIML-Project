"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Send, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Message {
  id: number
  sender: "doctor" | "patient"
  text: string
  timestamp: Date
}

interface PatientDetails {
  name: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "patient",
      text: "Hello Doctor, I've been experiencing some issues.",
      timestamp: new Date(Date.now() - 3600000),
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [response, setResponse] = useState<string | null>(null)
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null)

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) window.location.href = "/";

    const fetchPatientDetails = async () => {
      const res = await fetch('http://localhost:5000/api/v1/doctor/patient-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      if (res.ok) {
        const data = await res.json()
        setPatientDetails(data)
      } else {
        console.error('Failed to fetch patient details')
      }
    }

    fetchPatientDetails()
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "") return

    const newMsg: Message = {
      id: Date.now(), // Use the current timestamp as a unique id
      sender: "doctor",
      text: newMessage,
      timestamp: new Date(),
    }

    setMessages((prevMessages) => [...prevMessages, newMsg])
    setNewMessage("")

    let token = localStorage.getItem("token");
    if (!token) window.location.href = "/";

    const res = await fetch('http://localhost:5000/api/v1/doctor/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question: newMessage }),
    })

    if (res.ok) {
      const data = await res.json()
      const msg: Message = {
        id: Date.now(), // Use a new timestamp for the response message id
        sender: "patient",
        text: data.answer,
        timestamp: new Date(),
      }

      setMessages((prevMessages) => [...prevMessages, msg])
      setNewMessage("")
    } else {
      const msg: Message = {
        id: Date.now(), // Use a new timestamp for the error message id
        sender: "patient",
        text: "Sorry, something went wrong.",
        timestamp: new Date(),
      }

      setMessages((prevMessages) => [...prevMessages, msg])
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-red-700 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-red-600 p-2 mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">MediConnect</h1>
          </div>
          <div className="flex items-center space-x-2">
            {patientDetails && (
              <div className="text-right">
                <p className="font-medium">{patientDetails.name}</p>
              </div>
            )}
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
              <span className="font-bold">{patientDetails ? patientDetails.name.slice(0, 2).toUpperCase() : "N/A"}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <div className="border-b border-gray-200 bg-white">
              <div className="px-4 py-2 max-w-7xl mx-auto">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                    Chat
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col p-4 space-y-4 overflow-auto">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "doctor" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${message.sender === "doctor" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        <p>{message.text}</p>
                        <p
                          className={`text-xs mt-1 text-right ${message.sender === "doctor" ? "text-red-100" : "text-gray-500"
                            }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* {response && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800">
                        <p>{response}</p>
                      </div>
                    </div>
                  )} */}
                </div>
              </ScrollArea>

              <Card className="border-red-100 mt-auto">
                <CardContent className="p-3">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 border-red-200 focus:border-red-500 focus:ring-red-500"
                    />
                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={newMessage.trim() === ""}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

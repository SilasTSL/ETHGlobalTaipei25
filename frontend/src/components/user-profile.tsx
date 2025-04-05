"use client"

import { useState } from "react"
import { User, Shield, Check, Edit, Copy, AlertTriangle, X, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { VerificationQR } from "@/components/verification-qr"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useVerification } from "@/components/contexts/verificationContext"

// Mock user data
const userData = {
  username: "@web3enthusiast",
  displayName: "Alex Johnson",
  bio: "Web3 developer and crypto enthusiast. Building the decentralized future one block at a time.",
  walletAddress: "0x7F3a...9c4E",
  joinDate: "March 2023",
  followers: 1245,
  following: 389,
  isVerified: false,
  avatar: "/placeholder.svg?height=100&width=100",
  badges: [
    { id: 1, name: "Early Adopter", icon: "🚀" },
    { id: 2, name: "Content Creator", icon: "🎬" },
  ],
  activities: [
    { id: 1, type: "post", description: "Posted a new video", date: "2 days ago" },
    { id: 2, type: "comment", description: "Commented on @cryptoCreator's video", date: "3 days ago" },
    { id: 3, type: "like", description: "Liked 5 videos", date: "1 week ago" },
  ],
}

export function UserProfile() {
  const { isVerified, setVerificationStatus } = useVerification()
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showVerificationAlert, setShowVerificationAlert] = useState(true)

  const handleStartVerification = () => {
    setShowVerificationDialog(true)
  }

  const handleVerificationComplete = () => {
    setIsVerifying(true)

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false)
      setVerificationStatus(true)
      setShowVerificationDialog(false)
      setShowVerificationAlert(false)
    }, 3000)
  }

  return (
    <div className="h-full bg-black text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Edit className="h-5 w-5" />
        </Button>
      </div>

      {!isVerified && showVerificationAlert && (
        <Alert className="bg-amber-950/50 border-amber-600/50 text-amber-100 mb-4">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500 flex items-center gap-2">
            Verification Required
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-auto"
              onClick={() => setShowVerificationAlert(false)}
            >
              <X className="h-3 w-3 text-amber-500" />
            </Button>
          </AlertTitle>
          <AlertDescription className="text-amber-200/80 text-xs mt-1">
            Your account is not verified. This means:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Restricted access to content (age/geographic)</li>
              <li>No access to data payouts</li>
              <li>No access to reward distribution</li>
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 bg-amber-600/20 border-amber-600/50 text-amber-100 hover:bg-amber-600/30 hover:text-amber-50"
              onClick={handleStartVerification}
            >
              <Shield className="mr-2 h-3 w-3" />
              Verify Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-20 h-20 border-2 border-primary mb-3">
          <AvatarImage src={userData.avatar} alt={userData.displayName} />
          <AvatarFallback>
            <User className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold">{userData.displayName}</h2>
          {isVerified ? <Shield className="h-5 w-5 text-primary" /> : null}
        </div>

        <p className="text-gray-400 mb-3">{userData.username}</p>

        <p className="text-sm text-center text-gray-300 mb-4 max-w-xs">{userData.bio}</p>

        <div className="flex gap-4 mb-4">
          <div className="text-center">
            <p className="font-bold">{userData.followers}</p>
            <p className="text-xs text-gray-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{userData.following}</p>
            <p className="text-xs text-gray-400">Following</p>
          </div>
        </div>

        {!isVerified ? (
          <div className="flex items-center gap-2 mb-2">
            <Button onClick={handleStartVerification}>
              <Shield className="mr-2 h-4 w-4" />
              Verify Identity
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 border-gray-700 text-white max-w-xs">
                  <div className="text-xs">
                    <p className="font-medium mb-1">Why verify your identity?</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Access all content without restrictions</li>
                      <li>Receive payouts for your data contributions</li>
                      <li>Participate in reward distributions</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-primary/20 px-3 py-1.5 rounded-full mb-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Verified with Self Protocol</span>
          </div>
        )}
      </div>

      <Card className="bg-gray-900 border-gray-800 mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">Wallet Address</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">{userData.walletAddress}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Joined</span>
            <span className="text-sm">{userData.joinDate}</span>
          </div>
        </CardContent>
      </Card>

      {!isVerified && (
        <Card className="bg-gray-900/50 border-primary/30 border-dashed mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-full mt-0.5">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">Limited Account Access</h3>
                <p className="text-xs text-gray-400 mb-2">Your unverified status limits your experience:</p>
                <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1 mb-3">
                  <li>Some content is restricted based on age/location</li>
                  <li>You cannot receive payments for your data contributions</li>
                  <li>You are excluded from platform rewards and airdrops</li>
                </ul>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleStartVerification}>
                  Verify to Unlock Full Access
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="badges" className="h-[calc(100%-450px)]">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="h-full">
          <ScrollArea className="h-full pr-4 pb-4">
            <div className="space-y-3">
              {userData.badges.map((badge) => (
                <Card key={badge.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-xl">
                        {badge.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{badge.name}</h3>
                        <p className="text-xs text-gray-400">Earned for early platform adoption</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="activity" className="h-full">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {userData.activities.map((activity) => (
                <div key={activity.id} className="border-b border-gray-800 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{activity.description}</span>
                    <span className="text-xs text-gray-400">{activity.date}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {activity.type === "post"
                      ? "Content Creation"
                      : activity.type === "comment"
                        ? "Engagement"
                        : "Platform Activity"}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <VerificationQR
        isOpen={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        onVerificationComplete={handleVerificationComplete}
        isVerifying={isVerifying}
      />
    </div>
  )
}


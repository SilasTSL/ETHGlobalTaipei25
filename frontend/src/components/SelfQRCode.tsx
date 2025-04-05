'use client';

import React, { useState, useEffect } from 'react';
import SelfQRcodeWrapper, { SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';
import { useVerification } from './contexts/verificationContext';

function SelfQRCode() {
  const [userId, setUserId] = useState<string | null>(null);
  const { setVerificationStatus, isVerified } = useVerification();

  useEffect(() => {
    // Generate a user ID when the component mounts
    setUserId(uuidv4());
  }, []);

  if (!userId) return null;

  // Create the SelfApp configuration
  const selfApp = new SelfAppBuilder({
    appName: "Lifestyle App",
    scope: process.env.NEXT_PUBLIC_SELF_VERIFIER_APP_SCOPE,
    endpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL}/verify-user`,
    userId,
    disclosures: {
      // Request passport information
      name: true,
      nationality: true,
      date_of_birth: true,
      
      // Set verification rules
      minimumAge: 18,
      excludedCountries: ["IRN", "PRK", "RUS"],
      ofac: true,
    },
  }).build();

  return (
    <div className="verification-container flex flex-col items-center justify-center gap-2">      
      <SelfQRcodeWrapper
        selfApp={selfApp}
        onSuccess={async () => {
          // Handle successful verification
          console.log("Verification successful in SelfQRCode!");
          await setVerificationStatus(true);
          console.log("Verification status:", isVerified);

          // Redirect or update UI
        }}
        size={200}
      />
      <p className="text-sm text-gray-500">
        User ID: {userId.substring(0, 8)}...
      </p>
    </div>
  );
}

export default SelfQRCode;
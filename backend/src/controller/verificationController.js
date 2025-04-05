import express from 'express';
import { getUserIdentifier, SelfBackendVerifier, countryCodes } from '@selfxyz/core';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const router = express.Router()

router.post('/verify-user', async (req, res) => {
    try {
      const { proof, publicSignals } = req.body;
  
      if (!proof || !publicSignals) {
        return res.status(400).json({ 
          success: false,
          message: 'Proof and publicSignals are required' 
        });
      }
  
      // Extract user ID from the proof
      const userId = await getUserIdentifier(publicSignals);
      console.log("Extracted userId:", userId);
  
      // Initialize verifier - adjust RPC URL for your preferred network
      const selfBackendVerifier = new SelfBackendVerifier(
        'https://polygon-rpc.com', // Change to your preferred network
        process.env.SELF_VERIFIER_APP_SCOPE    // Unique identifier for your app
      );
      
      // Configure age and location verification
      selfBackendVerifier.setMinimumAge(18); // Set minimum age requirement
      
      // Restrict specific countries (optional)
      selfBackendVerifier.excludeCountries(
        countryCodes.IRN,   // Iran
        countryCodes.PRK,   // North Korea
        countryCodes.CUB    // Cuba
        // Add more as needed
      );
      
      // Enable additional checks (optional)
      selfBackendVerifier.enableNameAndDobOfacCheck();
  
      // Verify the proof
      const result = await selfBackendVerifier.verify(proof, publicSignals);

      // Onchain verification
      console.log("Onchain verification");
      const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
      const contract = new ethers.Contract(
        "0x8527041F1dcBC44B9b69e4C1341bc9dF339FA268",
        ["function verifyUser(bytes,uint256[]) returns (bool)"],
        provider
      );

      const tx = await contract.verifyUser(proof, publicSignals);
      await tx.wait(); // Wait for blockchain confirmation
            
      if (result.isValid) {
        // Successful verification
        return res.status(200).json({
          success: true,
          verified: true,
          userId: userId,
          ageVerified: true,
          country: result.credentialSubject.country,
          details: {
            // Include only what you need from credentialSubject
            birthYear: result.credentialSubject.birthYear,
            countryCode: result.credentialSubject.countryCode
          }
        });
      } else {
        // Failed verification
        return res.status(403).json({
          success: false,
          verified: false,
          message: 'Verification failed',
          reasons: result.isValidDetails
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal verification error'
      });
    }
});

export default router;
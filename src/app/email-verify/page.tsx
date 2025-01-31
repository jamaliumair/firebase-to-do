"use client";
import { auth, verifyEmailFunc } from "@/firebase/firebaseauth";
import { db } from "@/firebase/firebasefirestore";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';


export default function EmailVerify() {
  const router = useRouter()

  const checkEmailVerification = async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload(); // Reload user info to get updated email verification status
      if (user.emailVerified) {
        let docRef = doc(db, 'Users', user.uid);
        await updateDoc(docRef, { emailVerified: true });
        router.push("/home");
        console.log("Your email has been verified!");
      } else {
        console.log("Email is not verified yet.");
      }

    }
  };

  // Listen for email verification status
  useEffect(() => {
    checkEmailVerification();
    const interval = setInterval(checkEmailVerification, 3000); // Check every 3 seconds

    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, []);



  return (
    <>
      <h1>Please check your email address for verification</h1>
      {/* <button onClick={verifyEmailFunc}>Send Verify Email</button> */}
      <Button variant="contained" endIcon={<SendIcon />} onClick={verifyEmailFunc}>
        Send
      </Button>
    </>
  )
}
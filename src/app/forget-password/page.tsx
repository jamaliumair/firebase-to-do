"use client"

import { forgetPassword } from "@/firebase/firebaseauth"
import Link from "next/link"
import { useState } from "react"

export default function ForgetPassword() {
    const [email, setEmail] = useState("")
    
    return (
        <>
        <h1>Forget Password</h1>
        <label htmlFor="email">Email:
            <input type="email" id="email" value={email} onChange={(e) => {setEmail(e.target.value)}}/>
        </label><br />
        <button onClick={() => {
            forgetPassword(email)
        }}>Send a password reset email</button><br />
        <Link href={"/login"}>Login Here</Link>
        </>
    )
}
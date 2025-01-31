"use client";

import { auth, loginWithEmailPassword, signupWithEmailPassword} from "@/firebase/firebaseauth";
import Link from "next/link";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { db } from "@/firebase/firebasefirestore";
import { app } from "@/firebase/firebaseconfig";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

type AuthForm = {
    btnLabel: string
}

export default function Authform({btnLabel}: AuthForm) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");


const provider = new GoogleAuthProvider();
const route = useRouter();

 function SinginWithGoogle() {
  signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    console.log(result)
    // The signed-in user info.
    const user = result.user;
    let docRef = doc(db,'Users',user.uid)
    checkingUserInDb(docRef, user)
    route.push("./home");
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
}

async function checkingUserInDb(docRef: any, user: any) {
  let currentUser = await getDoc(docRef);
  if(!currentUser.data()) {
   createUser(docRef,user);
  }
}

async function createUser(docRef: any, user:any) {
  await setDoc(docRef,{
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    isVerified: user.emailVerified,
  })
}


  const auth = getAuth(app)
  const signup = async () => {
    try {
        
        let userCredential = await createUserWithEmailAndPassword(auth, email , pass)
        // const { email, uid } = userCredential.user;
        console.log(userCredential , "signup successfully")
    } catch (error) {
        console.log(error)
    }
  }


  return (
    <>
      <label htmlFor="name">Name:
      <input type="text" id="name" value={name} onChange={(e) => {setName(e.target.value)}}/>
      </label><br />
      <label htmlFor="email">Email:
      <input type="email" id="email" value={email} onChange={(e) => {setEmail(e.target.value)}}/>
      </label><br />
      <label htmlFor="pass">Password:
      <input type="password" id="pass" value={pass} onChange={(e) => {setPass(e.target.value)}}/>
      </label><br />
      {
        btnLabel === "signup" ?
        <>
        <button onClick={
            () => { signupWithEmailPassword(name, email, pass) }}
          >
            Signup
          </button>
          <p>Already Have an account:
            <Link href="/login"> Login Here</Link>
          </p>
        </>:
        <>
        <button onClick={
            () => { loginWithEmailPassword(email, pass) }}
          >
            Login
          </button><br />
          <button onClick={
            SinginWithGoogle}
          >
            Login With Google
          </button><br />
        <Link href={"/forget-password"}>Forget Password</Link>
        <p>Create a new account:
        <Link href="/signup"> Signup Here</Link>
         </p>
        </>
      }
    </>
    
  )
}
"use client";

import { app } from "@/firebase/firebaseconfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type UserType = {
    email: string | null;
    username: string
}

type AuthContextType = {
    user: UserType | null,
    loginError: string,
    signupError: string,
    resetError: string,
    logoutError: string,
    error: string,
    setLogoutError: (logoutError: string) => void,
    setUser: (user: UserType) => void,
    setLoginError: (loginError: string) => void,
    setSignupError: (signupError: string) => void,
    setResetError: (resetError: string) => void,
    setError: (error: string) => void,
    // setLoginError: (loginError: string) => void,

}

const AuthContext = createContext<AuthContextType | null>(null);



export default function AuthContextProvider({children} : {children: ReactNode}) {

    const [user, setUser] = useState<UserType | null>(null);
    const [loginError, setLoginError] = useState("");
    const [signupError, setSignupError] = useState("");
    const [resetError, setResetError] = useState("");
    const [logoutError,setLogoutError] = useState("");
    const [error,setError] = useState("");

    const route = useRouter()

    useEffect(() => {
        const auth = getAuth(app);
        onAuthStateChanged(auth, (loggedInUser) => {
            if (loggedInUser) {
                if (loggedInUser.emailVerified) {

                    console.log(loggedInUser, "user sign in");
                    const {email,uid} = loggedInUser;
                    route.push("/home");
                } else {
                    route.push("/email-verify");
                }     
              
             }
            //   else {
              
            //   console.log("user singed out");
            //   setUser(null);
            //   route.push("/login");
            // }
          });
    }, [user])
    

    return (
        <AuthContext.Provider value={{
            user, setUser,loginError,signupError,resetError, setError, error,
            setLoginError, setResetError, setSignupError,setLogoutError, logoutError
            }}>
            {children}
        </AuthContext.Provider>
    )

}

export const AuthContextData = () => useContext(AuthContext);
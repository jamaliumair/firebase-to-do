import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
   sendEmailVerification, User, sendPasswordResetEmail, signOut, 
   signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import { app } from "./firebaseconfig";
import { db, saveUser } from "./firebasefirestore";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { doc, getDoc, setDoc } from "firebase/firestore";


export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function signupWithEmailPassword(username: string, email: string,
   password: string, setSignupError:(error: string) => void
  ) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const { email, uid, emailVerified } = userCredential.user;
      console.log(email, uid, username, 'user created successfully.');
      saveUser({ username, email: email as string, uid, emailVerified })
      setSignupError("");
      // ...
    })
    .catch((error) => {
       const errorCode = error.code;
  let message = "";

  switch (errorCode) {
    case "auth/invalid-credential":
      message = "The email address or password is not valid.";
      break;
    case "auth/user-not-found":
      message = "No account found with this email.";
      break;
    case "auth/wrong-password":
      message = "Incorrect password. Please try again.";
      break;
    case "auth/network-request-failed":
      message = "Network error. Please check your internet connection.";
      break;
    case "auth/email-already-in-use":
      message = "This email is already associated with an account.";
    case "auth/too-many-requests":
      message = "Too many failed attempts. Please try again later.";
      break;
    default:
      message = "An unexpected error occurred. Please try again.";
  }
  
  console.error(errorCode, error.message, message);
  setSignupError(message);
    });
}


export function loginWithEmailPassword( email: string,
   password: string,  setLoginError: (error: string) => void
  ) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      // const { email, uid, emailVerified } = userCredential.user;
      console.log(userCredential.user, 'user signed in')
      setLoginError("")
      // ...
    })
    .catch((error) => {
  const errorCode = error.code;
  let message = "";

  switch (errorCode) {
    case "auth/invalid-credential":
      message = "The email address or password is not valid.";
      break;
    case "auth/user-not-found":
      message = "No account found with this email.";
      break;
    case "auth/wrong-password":
      message = "Incorrect password. Please try again.";
      break;
    case "auth/network-request-failed":
      message = "Network error. Please check your internet connection.";
      break;
    case "auth/too-many-requests":
      message = "Too many failed attempts. Please try again later.";
      break;
    default:
      message = "An unexpected error occurred. Please try again.";
  }

  console.error(errorCode, error.message);
  setLoginError(message);
});
}


export const verifyEmailFunc = () => {
  sendEmailVerification(auth.currentUser as User)
    .then(() => {
      // Email verification sent!
      // ...
      console.log("verification sent")
    });

}



export const forgetPassword = (email: string, setError:(error: string) => void) => {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Password reset email sent!
      // ..
      setError("");
    })
    .catch((error) => {
      setError("Error occured during the proccess");
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
}


export const logoutFunc = (router: AppRouterInstance, setError:(error: string) => void) => {
  signOut(auth)
  .then(() => {
    router.push("/login")
    console.log("logged out");
    setError("");
  })
  .catch((error) => {
    setError("Error occured during the proccess");
    console.log("error occured");
  });
}



export function SinginWithGoogle(router: AppRouterInstance, setError:(error: string) => void) {
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
    router.push("./home");
    // IdP data available using getAdditionalUserInfo(result)
    // ...
    setError("");
  }).catch((error) => {
    setError("Error occured during the proccess");
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






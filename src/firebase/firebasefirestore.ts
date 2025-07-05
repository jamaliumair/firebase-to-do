"use client";

import { addDoc, collection, doc, DocumentData, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from "firebase/firestore";
import { app } from "./firebaseconfig";
import { auth } from "./firebaseauth";
import { AuthContextData } from "@/context/authcontext";

type UserType = {
  username: string,
  email: string,
  uid: string,
  emailVerified: boolean,
}

export const db = getFirestore(app);

export async function saveUser(User: UserType) {
  try {
    // let docRef = doc(db, "collectionName", "docId")
    // await setDoc("where", "what");
    let docRef = doc(db, "Users", User.uid);

    await setDoc(docRef, User);
    console.log("User saved successfully");
  } catch (error) {
    console.error("Error saving user:", error);
  }
}


export async function saveTodo(todos: { mytodo: string, isCompleted: boolean }, setError: (error: string) => void, resetForm: () => void) {
  try {
  if (!todos.mytodo || todos.mytodo.trim() === "") {
    setError("Todo cannot be empty");
    return console.error("Todo cannot be empty");
  }
    // collection(db, "collectionName")
    // addDoc("where", "what");
    let collectionRef = collection(db, "Todos");

    let uid = auth.currentUser?.uid;
    let newTodo = { todos, uid }

    await addDoc(collectionRef, newTodo);
    resetForm();
    console.log("new todo")
    setError("");
  } catch (error) {
    setError("Error saving todo");
    console.error("Error saving user:", error);
  }
}


export async function FetchData() {
  // let docRef = doc(db, "collectionName", "docId")
  // await getDoc(docRef)

  // let collectionRef =  collection(db, "collectionName")
  // await getDocs(collectionRef)
  // if (auth.currentUser) {

  let collectionRef = collection(db, "Todos");
  let currentUseruid = auth.currentUser?.uid

  let condition = where("uid", "==", currentUseruid)
  let q = query(collectionRef, condition)
  let allTodosSnapshot = await getDocs(q)


  // method 1
  // let allTodos: DocumentData[] = []
  //   allTodosSnapshot.forEach((todo) => {
  //   let todoData = todo.data();
  //   todoData.id = todo.id;
  //   allTodos.push(todoData)
  // })

  // method 2
  let allTodos = allTodosSnapshot.docs.map((todoSnapshot) => {
    let todoData = todoSnapshot.data();
    todoData.id = todoSnapshot.id;
    console.log('my',todoSnapshot.data());
    return todoData
    })  
    
      return allTodos;
  // console.log(todo.id, " => ", todo.data());
}
// }




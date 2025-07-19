"use client";

import { addDoc, collection, doc, getDocs, getFirestore, query, setDoc, Timestamp, where } from "firebase/firestore";
import { app } from "./firebaseconfig";
import { auth } from "./firebaseauth";

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
    const docRef = doc(db, "Users", User.uid);

    await setDoc(docRef, User);
    console.log("User saved successfully");
  } catch (error) {
    console.error("Error saving user:", error);
  }
}


export async function saveTodo(todos: { mytodo: string, isCompleted: boolean, createdAt: Timestamp }, setError: (error: string) => void, resetForm: () => void) {
  try {
  if (!todos.mytodo || todos.mytodo.trim() === "") {
    setError("Todo cannot be empty");
    return console.error("Todo cannot be empty");
  }
    // collection(db, "collectionName")
    // addDoc("where", "what");
    const collectionRef = collection(db, "Todos");

    const uid = auth.currentUser?.uid;
    const newTodo = { todos, uid }

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

  const collectionRef = collection(db, "Todos");
  const currentUseruid = auth.currentUser?.uid

  const condition = where("uid", "==", currentUseruid)
  const q = query(collectionRef, condition)
  const allTodosSnapshot = await getDocs(q)


  // method 1
  // let allTodos: DocumentData[] = []
  //   allTodosSnapshot.forEach((todo) => {
  //   let todoData = todo.data();
  //   todoData.id = todo.id;
  //   allTodos.push(todoData)
  // })

  // method 2
  const allTodos = allTodosSnapshot.docs.map((todoSnapshot) => {
    const todoData = todoSnapshot.data();
    todoData.id = todoSnapshot.id;
    console.log('my',todoSnapshot.data());
    return todoData
    })  
    
      return allTodos;
  // console.log(todo.id, " => ", todo.data());
}
// }




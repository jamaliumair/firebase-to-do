"use client"
import { AuthContextData } from "@/context/authcontext"
import { auth, logoutFunc } from "@/firebase/firebaseauth"
import { db, FetchData, saveTodo } from "@/firebase/firebasefirestore"
import { onAuthStateChanged } from "firebase/auth"
import { collection, deleteDoc, doc, DocumentData, getDoc, getDocs, onSnapshot, query, Unsubscribe, updateDoc, where } from "firebase/firestore"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


type todoType = {
    id: string;
    todo: string
}


export default function UserInfo() {
     const router = useRouter();

    const { setUser, user, setError } = AuthContextData()!
    const [mytodo, setMytodo] = useState("")
    const [editObj, setEditObj] = useState<null | todoType>(null)
    const [editTodo, setEditTodo] = useState(false)
    const [allTodos, setAllTodos] = useState<DocumentData[]>([]);
    const [isCompleted, setIsCompleted] = useState(false)

    useEffect(() => {
        //     fetchAllTodos()
        let detachAuthListner = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchData()
            }

            return () => {
                if (realTimeTodo) {
                    detachAuthListner();
                    realTimeTodo();
                    console.log("Component Unmount")
                }
            }
        })
    }, [])

    // const fetchAllTodos = async () => {
    //     let fetchedTodos: DocumentData[] = await FetchData();
    //     console.log("functin", fetchedTodos[0])
    //     setAllTodos(fetchedTodos)
    // }

    let realTimeTodo: Unsubscribe;

    const fetchData = async () => {
        let currentUseruid = auth.currentUser?.uid;

        if (!currentUseruid) {
            console.error("User is not authenticated or UID is undefined.");
        } else {
            const docRef = doc(db, "Users", currentUseruid); // currentUseruid is guaranteed to be a string here
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                let {email, username} = docSnap.data()
                 setUser({email, username})
            } else {
                // docSnap.data() will be undefined in this case
                console.log("No such document!");
            }
        }
        let collectionRef = collection(db, "Todos");
        // console.log(currentUseruid);
        let condition = where("uid", "==", currentUseruid)
        let q = query(collectionRef, condition)
        let allTodosClone = [...allTodos]

        realTimeTodo = onSnapshot(q, (querySnapshot) => {

            let userTodo = querySnapshot.docs.map((todoDoc) => ({
                ...todoDoc.data(),
                id: todoDoc.id

            }))
            setAllTodos(userTodo);
            console.log(userTodo)


            // snapshot.docChanges().forEach((change) => {
            //     let todo = change.doc.data();
            //     todo.id = change.doc.id;
            //     if (change.type === "added") {
            //         allTodosClone.push(todo)
            //         // setAllTodos((prevTodos) => [...prevTodos, todo]);
            //     }
            //     if (change.type === "modified") {
            //         let index = allTodosClone.findIndex((item) => item.id === todo.id)
            //         if (index !== -1) {
            //             allTodosClone[index] = todo;
            //         } else {
            //             console.log("Todo not found for modification");
            //         }
            //         console.log("Modified city: ", change.doc.data(), allTodosClone);
            //     }
            //     if (change.type === "removed") {
            //         allTodosClone = allTodosClone.filter((item) => item.id !== todo.id)
            //         console.log("Removed city: ", change.doc.data(), allTodosClone);
            //     }
            //     setAllTodos([...allTodosClone])

            // )};

        });

    }

    const updateData = async (editObj: todoType | null, isCompleted: boolean) => {
        const { id } = editObj
        try {
            const docRef = doc(db, 'Todos', id);
            await updateDoc(docRef, {
                todos: {
                    todo: mytodo,
                    isCompleted
                }
            });
            setMytodo("");
            setEditTodo(false)
            console.log(mytodo, id)
        } catch (error) {
            console.log("error", error)
        }
    }

    const delData = async (id: string) => {
        try {
            let docRef = doc(db, "Todos", id)
            await deleteDoc(docRef);
            console.log(id);
        } catch (error) {
            console.log("error", error)
        }
    }

    return (
        <>
            <h1>User Information </h1>
            <Link href={"/signup"}>Sign</Link>
            <h2>{user?.username}</h2>
            <h2>{user?.email}</h2>
            <label htmlFor="todo">Todo:
                <input type="text" name="todo" value={mytodo} onChange={(e) => { setMytodo(e.target.value) }} />
            </label><br />
            <label htmlFor="todo">Todo Status:
                <input type="checkbox" name="todo status" checked={isCompleted} onChange={() => { setIsCompleted(!isCompleted) }} />
            </label><br />
            {
                editTodo ?
                    <button onClick={
                        () => updateData(editObj, isCompleted)
                    }>Update</button> :
                    <button onClick={() => {
                        saveTodo({ mytodo, isCompleted })
                    }
                    }>Add</button>
            }

            {
                allTodos.length > 0 ?
                    allTodos.map(({ id, todos }, i) => (
                        <div>
                            <h1 key={id}>{todos.todo}</h1>
                            <p>Status: {todos.isCompleted ? "Completed" : "Incomplete"}</p>
                            <button onClick={() => {
                                setMytodo(todos.todo)
                                setEditTodo(true)
                                setEditObj({ id, todo: todos.todo })
                            }}>Edit</button>
                            <button onClick={() => delData(id)}>Delete</button>
                        </div>
                    )
                    ) :
                    <p>No todos available</p>
            }
            <button onClick={() => logoutFunc(router, setError)}>Logout</button>
        </>
    )
}
"use client"
import { AuthContextData } from "@/context/authcontext"
import { auth, logoutFunc } from "@/firebase/firebaseauth"
import { db, FetchData, saveTodo } from "@/firebase/firebasefirestore"
import { Box, Button, Typography, TextField, Checkbox, FormControlLabel, Card, CardContent, IconButton, Stack, Container, Skeleton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { onAuthStateChanged } from "firebase/auth"
import { collection, deleteDoc, doc, DocumentData, getDoc, getDocs, onSnapshot, query, Unsubscribe, updateDoc, where } from "firebase/firestore"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ColorModeSelect from "@/signIntheme/ColorModeSelect";


type todoType = {
    id: string;
    todo: string,
    i: number | null
}


export default function UserInfo() {
    const router = useRouter();

    const { setUser, user, setError, error } = AuthContextData()!
    const [mytodo, setMytodo] = useState("")
    const [editObj, setEditObj] = useState<null | todoType>(null)
    const [editTodo, setEditTodo] = useState(false)
    const [allTodos, setAllTodos] = useState<DocumentData[]>([]);
    const [isCompleted, setIsCompleted] = useState(false)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        //     fetchAllTodos()
        let detachAuthListner = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchData()
            } else {
                router.push("/signup")
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
                let { email, username } = docSnap.data()
                setUser({ email, username })
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
            setIsLoading(false);
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
        if (!editObj || !mytodo || mytodo.trim() === "") {
            setError("Please select a valid todo to update.");
            console.error("No valid todo selected for update.");
            return;
        }

        const { id, todo, i } = editObj;
        console.log("Updating todo:", id, todo, isCompleted);
        try {
            const docRef = doc(db, 'Todos', id);
            await updateDoc(docRef, {
                todos: {
                    mytodo: mytodo,
                    isCompleted
                }
            });
            // let updatedTodos = [...allTodos];
            // updatedTodos.splice(i!, 1, {
            //     id,
            //     todos: { mytodo: todo, isCompleted }
            // });
            // setAllTodos(updatedTodos);
            resetForm();
            setError("");
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
            setError("Error deleting todo");
            console.log("error", error)
        }
    }

    const resetForm = () => {
        setMytodo("");
        setIsCompleted(false);
    };


    return (
        <Container maxWidth="md" sx={{ py: 6 }}>

            <Box mb={4} textAlign="center">
                <Typography variant="h4" gutterBottom>User Information</Typography>
                {
                    user?.username ? (
                        <>
                            <Typography variant="h6">{user.username}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">{user.email}</Typography>
                        </>
                    ) : (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="column"
                            width="100%"
                            height={80} // Optional: adds vertical space for better centering
                        >
                            <Skeleton variant="text" width={210} height={60} />
                            <Skeleton variant="text" width={210} height={60} />
                        </Box>
                    )
                }

            </Box>

            <Box mb={4}>
                <Typography variant="h5" gutterBottom>Add / Edit Todo</Typography>
                <TextField
                    label="Todo"
                    fullWidth
                    size="small"
                    value={mytodo}
                    onChange={(e) => setMytodo(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <FormControlLabel
                    control={<Checkbox checked={isCompleted} onChange={() => setIsCompleted(!isCompleted)} />}
                    label="Mark as Completed"
                />
                <Box mt={2}>
                    {editTodo ? (
                        <Button variant="contained" onClick={() => updateData(editObj, isCompleted)}>Update</Button>
                    ) : (
                        <Button variant="contained" onClick={() => saveTodo({ mytodo, isCompleted }, setError, resetForm)}>Add</Button>
                    )}
                    {error && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </Box>

            <Box mb={4}>
                <Typography variant="h5" gutterBottom>Your Todos</Typography>

                {isLoading ? (
                    <Stack spacing={2}>
                        {[...Array(3)].map((_, index) => (
                            <Card key={index} variant="outlined">
                                <CardContent>
                                    <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
                                    <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                                    <Stack direction="row" spacing={1}>
                                        <Skeleton variant="rectangular" width={60} height={30} />
                                        <Skeleton variant="circular" width={30} height={30} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                ) : allTodos.length > 0 ? (
                    <Stack spacing={2}>
                        {allTodos.map(({ id, todos }, i) => (
                            <Card key={id} variant="outlined">
                                <CardContent>
                                    <Typography variant="h6">{todos.mytodo}</Typography>
                                    <Typography variant="body2" color={todos.isCompleted ? 'success.main' : 'warning.main'}>
                                        Status: {todos.isCompleted ? 'Completed' : 'Incomplete'}
                                    </Typography>
                                    <Stack direction="row" spacing={1} mt={2}>
                                        <Button
                                            variant="outlined"
                                            color="warning"
                                            size="small"
                                            onClick={() => {
                                                setMytodo(todos.mytodo);
                                                setEditTodo(true);
                                                setEditObj({ id, todo: todos.mytodo, i });
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <IconButton
                                            aria-label="delete"
                                            size="small"
                                            color="error"
                                            onClick={() => delData(id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                ) : (
                    <Typography color="text.secondary">No todos available</Typography>
                )}
            </Box>


            <Box textAlign="center">
                <Button variant="outlined" color="error" onClick={() => logoutFunc(router, setError)}>
                    Logout
                </Button>
            </Box>
        </Container>
    )
}
"use client"
import { AuthContextData } from "@/context/authcontext"
import { auth, logoutFunc } from "@/firebase/firebaseauth"
import { db, saveTodo } from "@/firebase/firebasefirestore"
import {
    Box,
    Button,
    Typography,
    TextField,
    Checkbox,
    FormControlLabel,
    Card,
    CardContent,
    IconButton,
    Stack,
    Container,
    Skeleton,
    Paper,
    Chip,
    Fade,
    Avatar,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { onAuthStateChanged } from "firebase/auth"
import { collection, deleteDoc, doc, DocumentData, getDoc, onSnapshot, query, Unsubscribe, updateDoc, where } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type todoType = {
    id: string;
    todo: string,
    i: number | null
}

export default function UserInfo() {
    const router = useRouter();
    const theme = useTheme();

    const { setUser, user, setError, error } = AuthContextData()!
    const [mytodo, setMytodo] = useState("")
    const [editObj, setEditObj] = useState<null | todoType>(null)
    const [editTodo, setEditTodo] = useState(false)
    const [allTodos, setAllTodos] = useState<DocumentData[]>([]);
    const [isCompleted, setIsCompleted] = useState(false)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const detachAuthListner = onAuthStateChanged(auth, (user) => {
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

    let realTimeTodo: Unsubscribe;

    const fetchData = async () => {
        const currentUseruid = auth.currentUser?.uid;

        if (!currentUseruid) {
            console.error("User is not authenticated or UID is undefined.");
        } else {
            const docRef = doc(db, "Users", currentUseruid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                const { email, username } = docSnap.data()
                setUser({ email, username })
            } else {
                console.log("No such document!");
            }
        }
        const collectionRef = collection(db, "Todos");
        const condition = where("uid", "==", currentUseruid)
        const q = query(collectionRef, condition)

        realTimeTodo = onSnapshot(q, (querySnapshot) => {
            const userTodo = querySnapshot.docs.map((todoDoc) => ({
                ...todoDoc.data(),
                id: todoDoc.id
            }))
            setAllTodos(userTodo);
            setIsLoading(false);
            console.log(userTodo)
        });
    }

    const updateData = async (editObj: todoType | null, isCompleted: boolean) => {
        if (!editObj || !mytodo || mytodo.trim() === "") {
            setError("Please select a valid todo to update.");
            console.error("No valid todo selected for update.");
            return;
        }

        const { id, todo } = editObj;
        console.log("Updating todo:", id, todo, isCompleted);
        try {
            const docRef = doc(db, 'Todos', id);
            await updateDoc(docRef, {
                todos: {
                    mytodo: mytodo,
                    isCompleted
                }
            });
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
            const docRef = doc(db, "Todos", id)
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

    const completedTodos = allTodos.filter(todo => todo.todos?.isCompleted);
    const incompleteTodos = allTodos.filter(todo => !todo.todos?.isCompleted);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 4
            }}
        >
            <Container maxWidth="lg">
                {/* Header Section */}
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: 4,
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                        <Box display="flex" alignItems="center" gap={3}>
                            <Avatar
                                sx={{
                                    width: 64,
                                    height: 64,
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    boxShadow: theme.shadows[8]
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                            <Box>
                                {user?.username ? (
                                    <>
                                        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                                            Welcome back, {user.username}!
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" fontWeight={400}>
                                            {user.email}
                                        </Typography>
                                        <Box display="flex" gap={2} mt={2}>
                                            <Chip
                                                label={`${allTodos.length} Total Tasks`}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                            />
                                            <Chip
                                                label={`${completedTodos.length} Completed`}
                                                color="success"
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Box>
                                    </>
                                ) : (
                                    <Box>
                                        <Skeleton variant="text" width={300} height={50} sx={{ mb: 1 }} />
                                        <Skeleton variant="text" width={200} height={30} sx={{ mb: 2 }} />
                                        <Box display="flex" gap={1}>
                                            <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 3 }} />
                                            <Skeleton variant="rectangular" width={120} height={24} sx={{ borderRadius: 3 }} />
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<LogoutIcon />}
                            onClick={() => logoutFunc(navigate, setError)}
                            sx={{
                                borderRadius: 3,
                                px: 3,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: theme.palette.error.main,
                                color: theme.palette.error.main,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                    borderColor: theme.palette.error.dark,
                                }
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Paper>

                <Box display="flex" gap={4} flexDirection={{ xs: 'column', lg: 'row' }}>
                    {/* Add Todo Section */}
                    <Box flex={{ lg: '0 0 400px' }}>
                        <Paper
                            elevation={16}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                height: 'fit-content'
                            }}
                        >
                            <Typography variant="h5" fontWeight={700} gutterBottom color="text.primary">
                                {editTodo ? 'Edit Todo' : 'Create New Todo'}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <TextField
                                label="What needs to be done?"
                                fullWidth
                                multiline
                                rows={3}
                                value={mytodo}
                                onChange={(e) => setMytodo(e.target.value)}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: theme.palette.primary.main,
                                        },
                                    }
                                }}
                                variant="outlined"
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isCompleted}
                                        onChange={() => setIsCompleted(!isCompleted)}
                                        icon={<RadioButtonUncheckedIcon />}
                                        checkedIcon={<CheckCircleIcon />}
                                        sx={{
                                            color: theme.palette.success.main,
                                            '&.Mui-checked': {
                                                color: theme.palette.success.main,
                                            }
                                        }}
                                    />
                                }
                                label="Mark as completed"
                                sx={{
                                    mb: 3,
                                    '& .MuiFormControlLabel-label': {
                                        fontWeight: 500
                                    }
                                }}
                            />

                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={editTodo ? <EditIcon /> : <AddIcon />}
                                onClick={() => editTodo ? updateData(editObj, isCompleted) : saveTodo({ mytodo, isCompleted }, setError, resetForm)}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    background: editTodo
                                        ? 'linear-gradient(45deg, #ff9800, #ff5722)'
                                        : 'linear-gradient(45deg, #667eea, #764ba2)',
                                    boxShadow: theme.shadows[8],
                                    '&:hover': {
                                        boxShadow: theme.shadows[12],
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {editTodo ? 'Update Todo' : 'Add Todo'}
                            </Button>

                            {error && (
                                <Fade in={!!error}>
                                    <Typography
                                        variant="body2"
                                        color="error"
                                        sx={{
                                            mt: 2,
                                            p: 2,
                                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
                                        }}
                                    >
                                        {error}
                                    </Typography>
                                </Fade>
                            )}
                        </Paper>
                    </Box>

                    {/* Todos List Section */}
                    <Box flex={1}>
                        <Paper
                            elevation={16}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                minHeight: 500
                            }}
                        >
                            <Typography variant="h5" fontWeight={700} gutterBottom color="text.primary">
                                Your Tasks
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            {isLoading ? (
                                <Stack spacing={3}>
                                    {[...Array(4)].map((_, index) => (
                                        <Card key={index} variant="outlined" sx={{ borderRadius: 3 }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
                                                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} />
                                                    <Box display="flex" gap={1}>
                                                        <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 2 }} />
                                                        <Skeleton variant="circular" width={40} height={40} />
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : allTodos.length > 0 ? (
                                <Stack spacing={3}>
                                    {allTodos.map(({ id, todos }, i) => (
                                        <Fade in key={id} timeout={300} style={{ transitionDelay: `${i * 100}ms` }}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 3,
                                                    border: `2px solid ${todos.isCompleted ? theme.palette.success.light : theme.palette.warning.light}`,
                                                    backgroundColor: todos.isCompleted
                                                        ? alpha(theme.palette.success.main, 0.05)
                                                        : alpha(theme.palette.warning.main, 0.05),
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: theme.shadows[12],
                                                        borderColor: todos.isCompleted ? theme.palette.success.main : theme.palette.warning.main,
                                                    }
                                                }}
                                            >
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                                                        {todos.isCompleted ? (
                                                            <CheckCircleIcon color="success" sx={{ mt: 0.5 }} />
                                                        ) : (
                                                            <RadioButtonUncheckedIcon color="warning" sx={{ mt: 0.5 }} />
                                                        )}
                                                        <Box flex={1}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    textDecoration: todos.isCompleted ? 'line-through' : 'none',
                                                                    color: todos.isCompleted ? 'text.secondary' : 'text.primary',
                                                                    fontWeight: 600,
                                                                    mb: 1
                                                                }}
                                                            >
                                                                {todos.mytodo}
                                                            </Typography>
                                                            <Chip
                                                                label={todos.isCompleted ? 'Completed' : 'In Progress'}
                                                                color={todos.isCompleted ? 'success' : 'warning'}
                                                                size="small"
                                                                variant="filled"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    borderRadius: 2
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>

                                                    <Box display="flex" justifyContent="flex-end" gap={1}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<EditIcon />}
                                                            onClick={() => {
                                                                setMytodo(todos.mytodo);
                                                                setIsCompleted(todos.isCompleted);
                                                                setEditTodo(true);
                                                                setEditObj({ id, todo: todos.mytodo, i });
                                                            }}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                borderColor: theme.palette.warning.main,
                                                                color: theme.palette.warning.main,
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                                                    borderColor: theme.palette.warning.dark,
                                                                }
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => delData(id)}
                                                            sx={{
                                                                color: theme.palette.error.main,
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                                    transform: 'scale(1.1)',
                                                                },
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Fade>
                                    ))}
                                </Stack>
                            ) : (
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    py={8}
                                    color="text.secondary"
                                >
                                    <CheckCircleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        No todos yet
                                    </Typography>
                                    <Typography variant="body1" textAlign="center">
                                        Start by adding your first task to get organized!
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}
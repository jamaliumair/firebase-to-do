"use client"
import { AuthContextData } from "@/context/authcontext"
import { auth, logoutFunc } from "@/firebase/firebaseauth"
import { db, saveTodo } from "@/firebase/firebasefirestore"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Chip,
  Stack,
  Skeleton,
  Paper,
  Divider,
  Fade,
  Slide,
  Grid,
  LinearProgress,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  ExitToApp as ExitToAppIcon,
  TaskAlt as TaskAltIcon,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { onAuthStateChanged } from "firebase/auth"
import { collection, deleteDoc, doc, DocumentData, getDoc, onSnapshot, query, Unsubscribe, updateDoc, where,Timestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


type todoType = {
    id: string;
    todo: string,
    i: number | null
}

const GradientBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  minHeight: "100vh",
  padding: theme.spacing(3),
}))

const GlassCard = styled(Card)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(20px)",
  borderRadius: theme.spacing(2),
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
  },
}))

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
}))


interface TodoCardProps {
  completed: boolean;
}

const TodoCard = styled(Card)<TodoCardProps>(({ theme, completed }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  transition: "all 0.3s ease-in-out",
  border: completed ? "2px solid #4caf50" : "2px solid transparent",
  background: completed
    ? "linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)"
    : "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
  "&:hover": {
    transform: "translateX(4px)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
}))

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
  },
}))

const HeaderAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(8),
  height: theme.spacing(8),
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  fontSize: "1.5rem",
  fontWeight: "bold",
  border: "4px solid white",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
}))


export default function UserInfo() {
    const router = useRouter();

    const { setUser, user, setError, error } = AuthContextData()!
    const [mytodo, setMytodo] = useState("")
    const [editObj, setEditObj] = useState<null | todoType>(null)
    const [editTodo, setEditTodo] = useState(false)
    const [allTodos, setAllTodos] = useState<DocumentData[]>([]);
    const [isCompleted, setIsCompleted] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    
 const completedCount = allTodos.filter((todo) => todo.todos?.isCompleted).length
  const totalCount = allTodos.length
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    useEffect(() => {
        //     fetchAllTodos()
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

    // const fetchAllTodos = async () => {
    //     let fetchedTodos: DocumentData[] = await FetchData();
    //     console.log("functin", fetchedTodos[0])
    //     setAllTodos(fetchedTodos)
    // }

    let realTimeTodo: Unsubscribe;

    const fetchData = async () => {
        const currentUseruid = auth.currentUser?.uid;

        if (!currentUseruid) {
            console.error("User is not authenticated or UID is undefined.");
        } else {
            const docRef = doc(db, "Users", currentUseruid); // currentUseruid is guaranteed to be a string here
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                const { email, username } = docSnap.data()
                setUser({ email, username })
            } else {
                // docSnap.data() will be undefined in this case
                console.log("No such document!");
            }
        }
        const collectionRef = collection(db, "Todos");
        // console.log(currentUseruid);
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

        const { id, todo} = editObj;
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


    return (
    <GradientBox>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box textAlign="center" mb={4}>
            <Box display="flex" justifyContent="center" mb={2}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                  mb: 2,
                }}
              >
                <TaskAltIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Task Manager Pro
            </Typography>
            <Typography variant="h6" color="rgba(255,255,255,0.8)">
              Stay organized, stay productive
            </Typography>
          </Box>
        </Fade>

        {/* User Info Card */}
        <Slide direction="up" in timeout={1000}>
          <GlassCard sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                {user ? (
                  <>
                    <HeaderAvatar>
                      {user.username
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </HeaderAvatar>
                    <Box ml={3} flex={1}>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {user.username}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                        <Typography variant="body1" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box display="flex" alignItems="center" width="100%">
                    <Skeleton variant="circular" width={80} height={80} />
                    <Box ml={3} flex={1}>
                      <Skeleton variant="text" width={200} height={40} />
                      <Skeleton variant="text" width={250} height={30} />
                    </Box>
                  </Box>
                )}
              </Box>

              {!isLoading && totalCount > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    Progress Overview
                  </Typography>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Completion Rate
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(completionPercentage)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={completionPercentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(0,0,0,0.1)",
                        "& .MuiLinearProgress-bar": {
                          background: "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <StatsCard elevation={0}>
                        <Typography variant="h3" fontWeight="bold">
                          {completedCount}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Completed
                        </Typography>
                      </StatsCard>
                    </Grid>
                    <Grid item xs={6}>
                      <StatsCard
                        elevation={0}
                        sx={{
                          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                        }}
                      >
                        <Typography variant="h3" fontWeight="bold">
                          {totalCount}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Tasks
                        </Typography>
                      </StatsCard>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </GlassCard>
        </Slide>

        {/* Add/Edit Todo Card */}
        <Slide direction="up" in timeout={1200}>
          <GlassCard sx={{ mb: 4 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                  <AddIcon />
                </Avatar>
              }
              title={
                <Typography variant="h5" fontWeight="bold">
                  {editTodo ? "Edit Task" : "Create New Task"}
                </Typography>
              }
              subheader={
                <Typography variant="body2" color="text.secondary">
                  {editTodo ? "Update your existing task" : "Add a new task to stay organized"}
                </Typography>
              }
            />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Task Description"
                  placeholder="What needs to be done?"
                  value={mytodo}
                  onChange={(e) => setMytodo(e.target.value)}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCompleted}
                      onChange={() => setIsCompleted(!isCompleted)}
                      sx={{
                        color: "#667eea",
                        "&.Mui-checked": {
                          color: "#667eea",
                        },
                      }}
                    />
                  }
                  label="Mark as completed"
                />

                <Stack direction="row" spacing={2}>
                  {editTodo ? (
                    <>
                      <ModernButton
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => updateData(editObj, isCompleted)}
                        sx={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        Update Task
                      </ModernButton>
                      <ModernButton
                        variant="outlined"
                        onClick={() => {
                          resetForm()
                          setEditTodo(false)
                          setEditObj(null)
                        }}
                      >
                        Cancel
                      </ModernButton>
                    </>
                  ) : (
                    <ModernButton
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => saveTodo({ mytodo, isCompleted, createdAt: Timestamp.now() }, setError, resetForm)}
                      sx={{
                        background: "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
                      }}
                    >
                      Add Task
                    </ModernButton>
                  )}
                </Stack>

                {error && (
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: "#ffebee",
                      border: "1px solid #ffcdd2",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </GlassCard>
        </Slide>

        {/* Todos List */}
        <Slide direction="up" in timeout={1400}>
          <GlassCard>
            <CardHeader
              avatar={
                <Avatar sx={{ background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)" }}>
                  <AssignmentIcon />
                </Avatar>
              }
              title={
                <Typography variant="h5" fontWeight="bold">
                  Your Tasks
                </Typography>
              }
              action={
                totalCount > 0 && (
                  <Chip
                    label={`${completedCount}/${totalCount} completed`}
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                )
              }
            />
            <Divider />
            <CardContent>
              {isLoading ? (
                <Stack spacing={2}>
                  {[...Array(3)].map((_, index) => (
                    <Paper key={index} sx={{ p: 3, borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Box flex={1}>
                          <Skeleton variant="text" width="70%" height={30} />
                          <Skeleton variant="text" width="40%" height={20} />
                        </Box>
                        <Skeleton variant="rectangular" width={60} height={30} />
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="circular" width={40} height={40} />
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : allTodos.length > 0 ? (
                <Stack spacing={2}>
                  {allTodos.map(({ id, todos }, i) => (
                    <Fade in key={id} timeout={500 + i * 100}>
                      <TodoCard completed={todos.isCompleted}>
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <IconButton
                              onClick={() => updateData({ id, todo: todos.mytodo, i }, !todos.isCompleted)}
                              sx={{
                                color: todos.isCompleted ? "#4caf50" : "#bdbdbd",
                                "&:hover": {
                                  backgroundColor: todos.isCompleted ? "#e8f5e8" : "#f5f5f5",
                                },
                              }}
                            >
                              {todos.isCompleted ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                            </IconButton>

                            <Box flex={1}>
                              <Typography
                                variant="h6"
                                sx={{
                                  textDecoration: todos.isCompleted ? "line-through" : "none",
                                  color: todos.isCompleted ? "#757575" : "#212121",
                                  fontWeight: todos.isCompleted ? 400 : 600,
                                }}
                              >
                                {todos.mytodo}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date().toLocaleDateString()}
                              </Typography>
                            </Box>

                            <Chip
                              label={todos.isCompleted ? "Completed" : "Pending"}
                              size="small"
                              sx={{
                                backgroundColor: todos.isCompleted ? "#e8f5e8" : "#fff3e0",
                                color: todos.isCompleted ? "#2e7d32" : "#f57c00",
                                fontWeight: "bold",
                              }}
                            />

                            <IconButton
                              onClick={() => {
                                setMytodo(todos.mytodo)
                                setEditTodo(true)
                                setEditObj({ id, todo: todos.mytodo, i })
                                setIsCompleted(todos.isCompleted)
                              }}
                              sx={{
                                color: "#2196f3",
                                "&:hover": { backgroundColor: "#e3f2fd" },
                              }}
                            >
                              <EditIcon />
                            </IconButton>

                            <IconButton
                              onClick={() => delData(id)}
                              sx={{
                                color: "#f44336",
                                "&:hover": { backgroundColor: "#ffebee" },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </TodoCard>
                    </Fade>
                  ))}
                </Stack>
              ) : (
                <Box textAlign="center" py={8}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: "#f5f5f5",
                      color: "#bdbdbd",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No tasks yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Add your first task to get started!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </GlassCard>
        </Slide>

        {/* Logout Button */}
        <Box textAlign="center" mt={4}>
          <ModernButton
            variant="outlined"
            startIcon={<ExitToAppIcon />}
            onClick={() => logoutFunc(router, setError)}
            sx={{
              borderColor: "#f44336",
              color: "#f44336",
              "&:hover": {
                borderColor: "#d32f2f",
                backgroundColor: "#ffebee",
              },
            }}
          >
            Logout
          </ModernButton>
        </Box>
      </Container>
    </GradientBox>
  )
}
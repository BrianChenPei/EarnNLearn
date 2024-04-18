import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  InputLabel,
} from "@mui/material";
import "../styles/LoginStyles.css";
import { db, auth } from "../functions/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiberPin } from "@mui/icons-material";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is signed in");
        const q = query(
          collection(db, "user"),
          where("userID", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const userType = doc.data().type;
          console.log(userType);

          switch (userType) {
            case "child":
              navigate(`/profile-balance/${user.uid}`);
              break;
            case "parent":
              navigate("/profiles");
              break;
            case "babysitter":
              navigate("/profiles");
              break;
            default:
              toast.error("Invalid account type");
              break;
          }
        });
      }
    });
  }, []);

  const signIn = async () => {
    try {
      const email = username + "@earnNlearn.com";
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user.uid);

      const q = query(collection(db, "user"), where("userID", "==", user.uid));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const userType = doc.data().type;
        console.log(userType);

        switch (userType) {
          case "child":
            navigate(`/profile-balance/${user.uid}`);
            break;
          case "parent":
            navigate("/profiles");
            break;
          case "babysitter":
            navigate("/profiles");
            break;
          default:
            toast.error("Invalid account type");
            break;
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
      />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar
          src="/EarnNLearn.jpg"
          alt="Logo"
          sx={{ width: 100, height: 100, marginBottom: 2 }} // Adjust size as needed
        />
        <Typography
          component="h1"
          variant="h5"
          sx={{ marginBottom: 2, color: "hotpink" }}
        >
          EarnNLearn
        </Typography>
        <Box component="form" noValidate className="form">
          <InputLabel htmlFor="username">Username</InputLabel>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            className="textField"
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputLabel htmlFor="password">Password</InputLabel>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label=""
            type="password"
            id="password"
            autoComplete="current-password"
            className="textField"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Typography className="accountPrompt">
            Don't have an account?{" "}
            <Link to="/register" className="linkText">
              Register.
            </Link>
          </Typography>
          <Button
            fullWidth
            variant="contained"
            className="signInButton"
            sx={{ mt: 3, mb: 2, backgroundColor: "#0D99FF" }}
            onClick={signIn}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;

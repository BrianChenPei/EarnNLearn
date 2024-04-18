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
import { auth, db } from "../functions/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// TODO Extract coin animation, and fix 30, 70% over population

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const container = document.querySelector(".coinsContainer");
    const createCoin = () => {
      const coin = document.createElement("div");
      coin.classList.add("coin");

      // Calculate a random position, avoiding the middle 40% of the page
      //need to change this so it randomly distributes the coins that fall within the middle 40% of the page/
      const position = Math.random() * 100;
      if (position > 30 && position < 70) {
        coin.style.left = position < 50 ? "10vw" : "90vw";
      } else {
        coin.style.left = position + "vw";
      }

      coin.style.animationDuration = Math.random() * 3 + 25 + "s"; // Randomize duration
      container.appendChild(coin);

      // Remove coin after animation ends
      coin.addEventListener("animationend", () => {
        coin.remove();
      });
    };

    // Create a new coin every 300 milliseconds
    const interval = setInterval(createCoin, 300);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

  const onRegister = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    else{
      try{
        let email = username + "@earnNlearn.com";
        await createUserWithEmailAndPassword(auth, email, password);
        const userRef = collection(db, 'user');
        await addDoc( userRef ,{
          userID: auth.currentUser.uid,
          email: email,
          balance: 0,
          lifetimeEarnings: 0,
          parentID: "",
          type: "parent",
        });
        await auth.signOut();
        navigate("/login");
      }
      catch(error){
        console.log(error)
        toast.error("Invalid email or password");
      }
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
        <div className="coinsContainer"></div>
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
        <Box
          component="form"
          noValidate
          className="form"
        >
          <InputLabel htmlFor="username">Username</InputLabel>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="textField"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="textField"
          />
          <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label=""
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="textField"
          />
          <Typography className="accountPrompt">
            Already have an account?{" "}
            <Link to="/login" className="linkText">
              Login.
            </Link>
          </Typography>
          <Button
            fullWidth
            variant="contained"
            className="signInButton"
            sx={{ mt: 3, mb: 2, backgroundColor: "#0D99FF" }}
            onClick={onRegister}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Register;

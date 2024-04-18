import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  InputLabel,
  Stack,
  MenuItem,
} from "@mui/material";
import "../styles/LoginStyles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db, profileAuth } from "../functions/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

function ProfileCreation() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("child");

  const handleCreate = async () => {
    if(username === "" || password === ""){
      toast.error("Please fill in all fields");
      return;
    }
    else if(username.includes("@"))
    {
      toast.error("Username cannot contain '@'");
      return;
    }
    else{
      const email = username + "@earnNlearn.com";
      await createUserWithEmailAndPassword(profileAuth, email, password);
      const userRef = collection(db, 'user');
      await addDoc( userRef ,{
        userID: profileAuth.currentUser.uid,
        email: email,
        balance: 0,
        parentID: auth.currentUser.uid,
        type: userType.toLowerCase(),
        lifetimeEarning: 0,
      });
      await profileAuth.signOut();
      navigate("/profiles");
    }
  };

  const handleCancel = () => {
    // Navigate back to profiles page
    navigate("/profiles");
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
          Add User
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
            placeholder="Enter username"
            onChange={(e) => {setUsername(e.target.value);}}
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
            placeholder="New password for user"
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            select
            margin="normal"
            required
            fullWidth
            name="userType"
            label="User Type"
            id="userType"
            className="textField"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <MenuItem value="child">Child</MenuItem>
            <MenuItem value="babysitter">Babysitter</MenuItem>
          </TextField>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 4, width: "100%", justifyContent: "center" }}
          >
            <Button variant="contained" color="primary" onClick={handleCreate}>
              Create
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}

export default ProfileCreation;

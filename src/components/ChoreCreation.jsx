import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../functions/firebase';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/LoginStyles.css";

function ChoreCreation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [due, setDue] = useState(null);

  const handleCreateChore = async () => {
    if (!title || !amount || !due) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "chore"), {
        title,
        amount: Number(amount),
        due: Timestamp.fromDate(new Date(due)), // Converts the Dayjs object to a Date and then to Firestore Timestamp
        status: 'In Progress',
        userID: id, // Using the actual userID from the selected child
        feedback: '',
      });
      toast.success("Chore created successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Error creating chore.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container component="main" maxWidth="xs">
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
          }}
        >
          <Avatar src="/EarnNLearn.jpg" alt="Logo" sx={{ width: 100, height: 100, marginBottom: 2 }} />
          <Typography component="h1" variant="h5" sx={{ color: 'hotpink', marginBottom: 3 }}>
            Chore Creation
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {/* Title Input */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Chore Title"
              name="title"
              autoComplete="title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {/* Amount Input */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="amount"
              label="Amount"
              type="number"
              id="amount"
              autoComplete="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{ inputProps: { min: 0 } }}
            />
            {/* Due Date Picker */}
            <DateTimePicker
              label="Due Date"
              value={due}
              onChange={setDue}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
            {/* Create Chore Button */}
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: '#0D99FF' }}
              onClick={handleCreateChore}
            >
              Create Chore
            </Button>
          </Box>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

export default ChoreCreation;

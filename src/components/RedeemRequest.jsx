import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, Stack, Avatar, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../functions/firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RedeemRequest() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [requestName, setRequestName] = useState('');
  const [requestValue, setRequestValue] = useState('');

  const handleCreate = async () => {
    if (!requestName || !requestValue) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      await addDoc(collection(db, "transaction"), {
        title: requestName,
        amount: Number(requestValue),
        type: "withdrawal",
        userID: id,
      });
      toast.success("Withdraw request created successfully!");
      navigate(-1); // Go back to the previous page
    } catch (e) {
      console.error("Error adding document: ", e);
      toast.error("Failed to create withdraw request.");
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Avatar src="/EarnNLearn.jpg" alt="Logo" sx={{ width: 100, height: 100, marginBottom: 2 }} />
      <Typography variant="h4" component="h1" sx={{ color: 'pink', mb: 4 }}>
        Redeem Request
      </Typography>
      <TextField
        label="Request Name"
        variant="outlined"
        value={requestName}
        onChange={(e) => setRequestName(e.target.value)}
        sx={{ mb: 2, width: '50%' }}
      />
      <TextField
        label="Request Value"
        variant="outlined"
        type="number"
        value={requestValue}
        onChange={(e) => setRequestValue(e.target.value)}
        InputProps={{ inputProps: { min: 0 } }}
        sx={{ mb: 2, width: '50%' }}
      />
      <Stack direction="row" spacing={2} sx={{ mt: 4, width: '100%', justifyContent: 'center' }}>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}

export default RedeemRequest;

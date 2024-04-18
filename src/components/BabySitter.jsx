import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query, where, setDoc, doc } from "firebase/firestore";
import { db, auth } from "../functions/firebase";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Container,
} from "@mui/material";
import CircularProgressBar from "./CircularProgressBar";
import MessageIcon from "@mui/icons-material/Message";
import dayjs from "dayjs";

function BabySitter() {
  const { id } = useParams();
  // State for the feedback dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [profile, setProfile] = useState({});
  const [chores, setChores] = useState([]);
  const [selectedChoreId, setSelectedChoreId] = useState(null);

  // Function to fetch profile data
  const fetchProfileData = async (profileId) => {
    const q = query(collection(db, "user"), where("userID", "==", profileId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data();
      setProfile({
        name: docData.email.split("@")[0],
        balance: docData.balance,
        lifetimeEarning: docData.lifetimeEarning,
        type: docData.type,
      });
    } else {
      console.log("Profile not found");
    }
  };

  // Function to fetch chores from Firestore
  const fetchChores = async (selectedChildID) => {
    const choresQuery = query(
      collection(db, "chore"),
      where("userID", "==", selectedChildID)
    );
    try {
      const querySnapshot = await getDocs(choresQuery);
      const fetchedChores = querySnapshot.docs.map((doc) => {
        const choreData = doc.data();
        return {
          id: doc.id,
          ...choreData,
          dueDate: choreData.due?.toDate
            ? dayjs(choreData.due.toDate()).format("YYYY-MM-DD HH:mm")
            : "No due date", // Converts Firestore Timestamp to readable date
        };
      });
      setChores(fetchedChores);
    } catch (error) {
      console.error("Error fetching chores:", error);
    }
  };

  // Fetch profile and chores on component mount and when id changes
  useEffect(() => {
    const userId = id || auth.currentUser.uid;
    fetchProfileData(userId);
    fetchChores(userId);
  }, [id]);

  const handleOpenDialog = (choreId) => {
    setOpenDialog(true);
    setSelectedChoreId(choreId);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFeedback("");
  };

  const handleSubmitFeedback = async () => {
    try {
      console.log ("selectedChoreId", selectedChoreId);
      await setDoc(doc(db, "chore", selectedChoreId),
      { feedback },
      { merge: true });
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
    handleCloseDialog();
  };

  return (
    <Container component="main">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "100%",
        }}
      >
        <CircularProgressBar
          size={150}
          thickness={4}
          value={profile.balance || 0}
          maxValue={profile.lifetimeEarning || 100}
          name={profile.name || "User"}
        />
        <Box sx={{ margin: 2, paddingBottom: 10, width: "100%" }}>
          {chores.map((chore) => (
            <Paper
              key={chore.id}
              sx={{
                display: "flex",
                width: "50%",
                mx: "auto",
                alignItems: "center",
                justifyContent: "space-between",
                marginY: 1,
                padding: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    bgcolor: "grey.300",
                    padding: 2,
                    marginRight: 2,
                    borderRadius: "50%",
                  }}
                >
                  <Typography sx={{ color: "pink", fontSize: "1.2rem" }}>
                    ${chore.amount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body1">{chore.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: {chore.dueDate}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        chore.status === "Awaiting Approval"
                          ? "orange"
                          : "green",
                    }}
                  >
                    {chore.status}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <IconButton
                  onClick={() => handleOpenDialog(chore.id)}
                  color="primary"
                >
                  <MessageIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
        {/* Feedback Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Chore Feedback</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="feedback"
              label="Feedback"
              type="text"
              fullWidth
              variant="standard"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmitFeedback}>Submit</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default BabySitter;

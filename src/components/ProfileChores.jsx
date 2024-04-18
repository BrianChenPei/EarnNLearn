import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Fab,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ProfileSwitch from "./ProfileSwitch";
import CircularProgressBar from "./CircularProgressBar";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth, getUserType } from "../functions/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MessageIcon from "@mui/icons-material/Message";
import dayjs from "dayjs";

function ProfileChores() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [isParent, setIsParent] = useState(false);
  const [chores, setChores] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Function to handle child selection
  const handleChildSelection = (childId) => {
    setSelectedChild(childId);
  };

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
      // setIsParent(docData.type == "parent");
      setIsParent((await getUserType()) == "parent");
      console.log(isParent);
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

  useEffect(() => {
    if (selectedChild) {
      fetchChores(selectedChild);
    }
  }, [selectedChild]);

  const handleApproval = async (choreId) => {
    try {
      // Step 1: Find the chore document to get the chore details.
      const choreRef = doc(db, "chore", choreId);
      const choreSnap = await getDoc(choreRef);

      if (!choreSnap.exists()) {
        console.log("No such chore!");
        toast.error("Chore not found!");
        return;
      }

      const choreData = choreSnap.data();

      if (isParent) {
        // Query to find the child's document in the "user" collection by userID
        const userQuery = query(
          collection(db, "user"),
          where("userID", "==", id)
        );
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
          console.log("No such user!");
          toast.error("User not found!");
          return;
        }

        // Assuming the first document is the correct user
        const childDoc = querySnapshot.docs[0];
        const childData = childDoc.data();

        // Calculate the new balance and possibly lifetime earnings
        let newBalance = (childData.balance += choreData.amount);
        let newLifetimeEarnings = (childData.lifetimeEarning +=
          choreData.amount);

        // Update the child's document with the new balance and lifetime earnings
        await updateDoc(doc(db, "user", childDoc.id), {
          balance: newBalance,
          lifetimeEarning: newLifetimeEarnings,
        });

        // Step 2: Update the chore's status to "Approved".
        await updateDoc(choreRef, { status: "Approved" });

        // Step 3: Create a transaction record for the approved chore.
        await addDoc(collection(db, "transaction"), {
          amount: choreData.amount,
          title: choreData.title, // Using the chore's title as the transaction title.
          type: "deposit", // Marking the transaction as an approved type.
          approved: true, // Marking the transaction as approved.
          userID: choreData.userID, // Assigning the chore's user ID to the transaction.
        });

        toast.success("Chore approved and transaction recorded!");

        // Step 4: Update the local chores state to reflect the approval without refetching.
        setChores((prevChores) =>
          prevChores.map((chore) =>
            chore.id === choreId ? { ...chore, status: "Approved" } : chore
          )
        );

        // Refresh the child's transactions and profile data
        fetchChores(id);
        fetchProfileData(id);
      }
      // If the user is a child, they can request approval for their chores.
      else {
        // Update the chore's status to "In Progress" to request approval.
        await updateDoc(choreRef, { status: "Awaiting Approval" });

        toast.success("Chore approval requested!");

        // Update the local chores state to reflect the approval without refetching.
        setChores((prevChores) =>
          prevChores.map((chore) =>
            chore.id === choreId ? { ...chore, status: "In Progress" } : chore
          )
        );
        // Refresh the child's transactions and profile data
        fetchChores(id);
      }
    } catch (error) {
      console.error("Error approving chore:", error);
      toast.error("Failed to approve chore.");
    }
  };

  const handleRemoval = async (choreId) => {
    try {
      await deleteDoc(doc(db, "chore", choreId));

      toast.success("Chore removed successfully!");

      // Update the chore list in state to remove the deleted chore
      setChores(chores.filter((chore) => chore.id !== choreId));
    } catch (error) {
      console.error("Error removing chore:", error);
      toast.error("Failed to remove chore.");
    }
  };

  const navigateToChoreCreation = () => {
    navigate(`/chore-creation/${id}`);
  };

  const handleOpenDialog = (feedback) => {
    setOpenDialog(true);
    setFeedback(feedback);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <ToastContainer position="top-right" autoClose={5000} />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CircularProgressBar
          size={150}
          thickness={4}
          value={profile.balance || 0}
          maxValue={profile.lifetimeEarning || 100}
          name={profile.name || "User"}
        />
        <ProfileSwitch id={id} />
        <Box sx={{ margin: 2, paddingBottom: 10, width: "100%" }}>
          {chores.map((chore) => (
            <Paper
              key={chore.id}
              sx={{
                display: "flex",
                width: "80%",
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
                        chore.status === "In Progress"
                          ? "red"
                          : chore.status === "Awaiting Approval"
                          ? "orange"
                          : "green",
                    }}
                  >
                    {chore.status}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "stretch" }}>
                {isParent && (
                  <IconButton
                    onClick={() => handleOpenDialog(chore.feedback)}
                    color="primary"
                  >
                    <MessageIcon />
                  </IconButton>
                )}
                {((isParent && chore.status !== "Approved") ||
                  (!isParent && chore.status === "In Progress")) && (
                  <IconButton
                    onClick={() => handleApproval(chore.id)}
                    color="success"
                  >
                    <CheckCircleOutlineIcon />
                  </IconButton>
                )}
                {isParent && (
                  <IconButton
                    onClick={() => handleRemoval(chore.id)}
                    color="error"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                )}
              </Box>
            </Paper>
          ))}

          {isParent && (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
              <Fab
                color="primary"
                aria-label="add"
                onClick={navigateToChoreCreation}
              >
                <AddIcon />
              </Fab>
            </Box>
          )}
        </Box>
        {/* Feedback Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Feedback from Babysitter</DialogTitle>
          <DialogContent>
            <Typography variant="body1">{feedback}</Typography>
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
}

export default ProfileChores;

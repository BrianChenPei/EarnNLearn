import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Divider,
  Button,
  IconButton,
  Paper,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ProfileSwitch from "./ProfileSwitch";
import CircularProgressBar from "./CircularProgressBar";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth, getUserType } from "../functions/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProfileBalance() {
  const { id } = useParams();
  const [profile, setProfile] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isParent, setIsParent] = useState(false);

  const handleChildSelection = (childId) => {
    setSelectedChild(childId);
  };

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
      setIsParent((await getUserType()) == "parent");
    } else {
      console.log("Profile not found");
    }
  };

  const fetchTransactions = async (selectedChildID) => {
    const transactionsQuery = query(
      collection(db, "transaction"),
      where("userID", "==", selectedChildID)
    );
    try {
      const querySnapshot = await getDocs(transactionsQuery);
      const fetchedTransactions = querySnapshot.docs.map((doc) => {
        const transactionData = doc.data();
        return {
          id: doc.id,
          ...transactionData,
        };
      });
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    const userId = id || auth.currentUser.uid;
    fetchProfileData(userId);
    fetchTransactions(userId);
  }, [id]);

  useEffect(() => {
    if (selectedChild) {
      fetchTransactions(selectedChild);
    }
  }, [selectedChild]);

  const handleApproval = async (transactionId) => {
    try {
      // Retrieve the transaction details
      const transactionRef = doc(db, "transaction", transactionId);
      const transactionSnap = await getDoc(transactionRef);
      if (!transactionSnap.exists()) {
        console.log("No such transaction!");
        toast.error("Transaction not found!");
        return;
      }

      const transaction = transactionSnap.data();

      // Query to find the child's document in the "user" collection by userID
      const userQuery = query(
        collection(db, "user"),
        where("userID", "==", transaction.userID)
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
      let newBalance = childData.balance;
      let newLifetimeEarnings = childData.lifetimeEarning;

      if (transaction.type === "approved") {
        newBalance += transaction.amount;
        newLifetimeEarnings += transaction.amount;
      } else if (transaction.type === "withdrawal") {
        newBalance -= transaction.amount;
      }

      // Update the child's document with the new balance and lifetime earnings
      await updateDoc(doc(db, "user", childDoc.id), {
        balance: newBalance,
        lifetimeEarning: newLifetimeEarnings,
      });

      await updateDoc(doc(db, "transaction", transactionId), {
        approved: true,
      });

      toast.success("Transaction approved successfully!");
      setTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transaction) => transaction.id !== transactionId
        )
      );
      // Refresh the child's transactions and profile data
      fetchTransactions(transaction.userID);
      fetchProfileData(transaction.userID);
    } catch (error) {
      console.error("Error approving transaction:", error);
      toast.error("Failed to approve transaction.");
    }
  };

  const handleRemoval = async (transactionId) => {
    try {
      await deleteDoc(doc(db, "transaction", transactionId));
      toast.success("Transaction removed successfully!");
      setTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transaction) => transaction.id !== transactionId
        )
      );
    } catch (error) {
      console.error("Error removing transaction:", error);
      toast.error("Failed to remove transaction.");
    }
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
        <Typography component="h2" variant="h5" sx={{ marginY: 2 }}>
          Transactions
        </Typography>
        <Box sx={{ overflowY: "auto", maxHeight: "500px", width: "100%" }}>
          {transactions
            .sort((a, b) => (a.approved === b.approved ? 0 : a.approved ? 1 : -1))
            .map((transaction, index) => (
              <Paper key={transaction.id} sx={{ marginY: 1, padding: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <FiberManualRecordIcon
                      sx={{
                        color: transaction.type === "deposit" ? "green" : "red",
                        marginRight: 2,
                        verticalAlign: "bottom",
                      }}
                    />
                    <Typography variant="body1" display="inline">
                      {transaction.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type:{" "}
                      {transaction.type.charAt(0).toUpperCase() +
                        transaction.type.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {transaction.approved ? "Approved" : "Pending"}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body1">${transaction.amount}</Typography>
                    {isParent && !transaction.approved && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: 1,
                        }}
                      >
                        <IconButton
                          onClick={() => handleApproval(transaction.id)}
                          color="success"
                        >
                          <CheckCircleOutlineIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleRemoval(transaction.id)}
                          color="error"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>
                {index !== transactions.length - 1 && <Divider sx={{ my: 1 }} />}
              </Paper>
            ))}
        </Box>
        <Button
          component={Link}
          to={`/redeem-request/${id}`}
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Withdraw
        </Button>
      </Box>
    </Container>
  );
}

export default ProfileBalance;

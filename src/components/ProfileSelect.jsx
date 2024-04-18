import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Button, Avatar } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, getUserType } from "../functions/firebase";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMediaQuery } from "react-responsive";

function ProfileSelect() {
  const [childProfiles, setChildProfiles] = useState([]);
  const [babysitterProfiles, setBabysitterProfiles] = useState([]);
  const [userType, setUserType] = useState(null);
  const [userParent, setUserParent] = useState(null);

  const navigate = useNavigate();
  //Function made by CoPilot
  const randomPastelColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const getUserParent = async () => {
    if (!auth.currentUser) {
      console.log("User not logged in");
      return;
    }
    const userRef = collection(db, "user");
    const q = query(userRef, where("userID", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      return doc.data().parentID;
    }
  };

  const fetchProfiles = async (type, parentID) => {
    try {
      console.log(auth.currentUser.uid);
      const userRef = collection(db, "user");

      if (type === "parent") {
        // Query where parentID is equal to currentUser.id
        const q = query(
          userRef,
          where("type", "in", ["child", "babysitter"]),
          where("parentID", "==", auth.currentUser.uid)
        );

        const data = await getDocs(q);

        const childProfiles = [];
        const babysitterProfiles = [];

        data.forEach((doc) => {
          const profile = {
            id: doc.data().userID,
            name: doc.data().email.split("@")[0],
            color: randomPastelColor(),
          };

          if (doc.data().type === "child") {
            childProfiles.push(profile);
          } else if (doc.data().type === "babysitter") {
            babysitterProfiles.push(profile);
          }
        });

        setChildProfiles(childProfiles);
        setBabysitterProfiles(babysitterProfiles);
        console.log("Retrieved profiles successfully!");
      } else if (type === "babysitter") {
        // Query where parentID is equal to the parentID of the currentUser
        const q = query(
          userRef,
          where("type", "in", ["child"]),
          where("parentID", "==", parentID)
        );

        const data = await getDocs(q);
        const childProfiles = [];
        data.forEach((doc) => {
          const profile = {
            id: doc.data().userID,
            name: doc.data().email.split("@")[0],
            color: randomPastelColor(),
          };
          childProfiles.push(profile);
        });
        setChildProfiles(childProfiles);
        console.log("Retrieved profiles successfully!");
      } else if (type === "child") {
        navigate("/profile-balance/" + auth.currentUser.uid);
      }
    } catch (error) {
      console.log("Error getting documents: ", error);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      const type = await getUserType();
      const parentID = await getUserParent();
      setUserType(type);
      setUserParent(parentID);
      fetchProfiles(type, parentID);
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in");
        fetchAll();
      } else {
        console.log("User is not signed in");
        navigate("/login");
      }
    });
  }, []);
  const handleDelete = async (profileId) => {
    if (!profileId) {
      console.error("No profile ID provided");
      return;
    }
    const userRef = collection(db, "user");
    const q = query(userRef, where("userID", "==", profileId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.error("No matching documents.");
      return;
    }
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref);
    });
    console.log("Document successfully deleted!");
    fetchProfiles();
  };

  const isSmallScreen = useMediaQuery({ query: "(max-width: 300px)" });

  return (
    <Container component='main' maxWidth='sm'>
      <Box
        key={0}
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar
          src='/EarnNLearn.jpg'
          alt='Logo'
          sx={{ width: 100, height: 100, marginBottom: 2 }} // Adjust size as needed
        />
        <Typography component='h1' variant='h4' sx={{ marginBottom: 3 }}>
          Profiles
        </Typography>
        <Typography component='h3' variant='h5' sx={{ marginBottom: 3 }}>
          Children
        </Typography>
        {childProfiles.map((profile) => (
          <Box
            sx={{
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 0,
              margin: isSmallScreen ? 0 : "auto",
              marginBottom: 1,
              border: "1px solid #ccc",
              borderRadius: "5px",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
              width: isSmallScreen ? "auto" : "100%",
              transform: isSmallScreen ? "scale(0.8)" : "scale(1)",
              transition: "transform 0.3s ease-in-out",
            }}
          >
            <Link
              key={profile.id}
              to={
                userType === "parent"
                  ? `/profile-balance/${profile.id}`
                  : `/babysitter/${profile.id}`
              }
              style={{
                textDecoration: "none",
                width: "100%",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                  cursor: "pointer",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", margin: 2 }}>
                <Avatar sx={{ bgcolor: profile.color, marginRight: 2 }} />
                <Typography variant='h6' sx={{ color: "black" }}>
                  {profile.name}
                </Typography>
              </Box>
            </Link>
            {userType === "parent" && (
              <IconButton
                sx={{ marginRight: 2 }}
                onClick={(event) => {
                  event.stopPropagation(); // Stop event propagation
                  handleDelete(profile.id);
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}

        {userType === "parent" && (
          <Typography
            component='h3'
            variant='h5'
            sx={{ marginTop: 2, marginBottom: 3 }}
          >
            Babysitters
          </Typography>
        )}
        {userType === "parent" &&
          babysitterProfiles.map((profile) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 0,
                margin: isSmallScreen ? 0 : "auto",
                marginBottom: 1,
                border: "1px solid #ccc",
                borderRadius: "5px",
                width: isSmallScreen ? "auto" : "100%",
                transform: isSmallScreen ? "scale(0.8)" : "scale(1)",
                transition: "transform 0.3s ease-in-out",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", margin: 2 }}>
                <Avatar sx={{ bgcolor: profile.color, marginRight: 2 }} />
                <Typography variant='h6' sx={{ color: "grey" }}>
                  {profile.name}
                </Typography>
              </Box>
              <IconButton
                sx={{ marginRight: 2 }}
                onClick={() => handleDelete(profile.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        {userType === "parent" && (
          <Button
            variant='contained'
            sx={{ marginTop: 2 }}
            startIcon={<AddIcon />}
            component={Link}
            to='/add-profile'
          >
            Add Profile
          </Button>
        )}
      </Box>
    </Container>
  );
}

export default ProfileSelect;

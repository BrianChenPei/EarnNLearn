import {} from "react-router-dom";
import { auth, getUserType } from "../functions/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Typography } from "@mui/material";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Declare a new state variable for the user
  const [userType, setUserType] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Set the user state variable
    });
    const fetchUserType = async () => {
      const type = await getUserType();
      setUserType(type);
    };

    fetchUserType();
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        console.log("User signed out");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Sign out error", error);
      });
  };

  return (
    <div>
      <nav style={{ display: "flex", justifyContent: "space-between" }}>
        {user && (
          <Typography
            component='h2'
            variant='h6'
            sx={{ color: "grey", fontSize: 14, marginTop: 1, marginLeft: 1 }}
          >
            {user.email.split("@")[0]}
          </Typography>
        )}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              marginTop: 5,
              marginRight: 5,
              fontSize: 12,
              backgroundColor: "grey",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </nav>
      {user &&
        userType !== "child" &&
        location.pathname !== "/profiles" &&
        location.pathname !== "/chore-creation" &&
        location.pathname !== "/redeem-request" &&
        location.pathname !== "/add-profile" && (
          <button
            onClick={() => {
              navigate("/profiles");
            }}
            style={{
              padding: 8,
              marginTop: 8,
              marginLeft: 8,
              fontSize: 12,
              backgroundColor: "grey",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {"< Profiles"}
          </button>
        )}
    </div>
  );
}

export default Navbar;

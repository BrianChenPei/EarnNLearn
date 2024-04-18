import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ProfileSelect from "./components/ProfileSelect";
import ProfileBalance from "./components/ProfileBalance";
import ProfileChores from "./components/ProfileChores";
import ChoreCreation from "./components/ChoreCreation";
import RedeemRequest from "./components/RedeemRequest";
import ProfileCreation from "./components/ProfileCreation";
import BabySitter from "./components/BabySitter";
import NavBar from "./components/NavBar"; // Import the Navbar component

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/profiles' element={<ProfileSelect />} />
        <Route path='/profile-balance/:id' element={<ProfileBalance />} />
        <Route path='/profile-chores/:id' element={<ProfileChores />} />
        <Route path='/chore-creation/:id' element={<ChoreCreation />} />
        <Route path='/redeem-request/:id' element={<RedeemRequest />} />
        <Route path='/add-profile' element={<ProfileCreation />} />
        <Route path='/babysitter/:id' element={<BabySitter />} />
        <Route path='/' element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

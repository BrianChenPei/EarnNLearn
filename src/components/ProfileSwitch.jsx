import React, { useState, useEffect } from 'react';
import { ToggleButtonGroup, ToggleButton, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom'; 


// TODO routing ID is hardcoded right now in the handleAlignment block

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'white',
    backgroundColor: 'pink',
  },
  backgroundColor: 'white',
  color: 'black',
  "&:hover": {
    backgroundColor: "lightblue",
  }
}));

function ProfileSwitch(props) {
  const { id } = props;
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current location
  const [alignment, setAlignment] = useState(location.pathname.includes('chores') ? 'chores' : 'balance');

  useEffect(() => {
    // Update the alignment when the location changes
    setAlignment(location.pathname.includes('chores') ? 'chores' : 'balance');
  }, [location]);

  const handleAlignment = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      if (newAlignment === 'balance') {
        navigate('/profile-balance/' + props.id); // Adjust the route as needed
      } else if (newAlignment === 'chores') {
        navigate('/profile-chores/' + props.id); // Adjust the route as needed
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <StyledToggleButtonGroup
        size="small"
        value={alignment}
        exclusive
        onChange={handleAlignment}
        aria-label="Profile section"
      >
        <StyledToggleButton value="chores" aria-label="Chores">
          Chores
        </StyledToggleButton>
        <StyledToggleButton value="balance" aria-label="Balance">
          Balance
        </StyledToggleButton>
      </StyledToggleButtonGroup>
    </Box>
  );
}

export default ProfileSwitch;
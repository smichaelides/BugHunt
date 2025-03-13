import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout, user } = useAuth0();

  return (
    <button 
      className='auth-button' 
      onClick={() => logout({ returnTo: window.location.origin })}
    >
      Logout {user?.name}
    </button>
  );
};

export default LogoutButton; 
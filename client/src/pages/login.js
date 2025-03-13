import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  if (isAuthenticated) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to BugHunt</h1>
        <p>Debug your way to the top!</p>
        <button 
          className="login-button" 
          onClick={() => loginWithRedirect()}
        >
          Login to Start
        </button>
      </div>
    </div>
  );
};

export default Login; 
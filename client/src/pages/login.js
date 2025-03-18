import React, { useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const { 
    isAuthenticated, 
    loginWithRedirect, 
    user, 
    isLoading, 
    error 
  } = useAuth0();

  console.log('Login Component State:', { 
    isAuthenticated, 
    hasUser: !!user, 
    isLoading, 
    error 
  });

  const handleUserLogin = useCallback(async () => {
    if (!user) return;
    
    console.log('Handling user login with data:', user);
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          nickname: user.nickname
        })
      });

      console.log('Server response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const userData = await response.json();
      console.log('User successfully saved:', userData);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }, [user]);

  useEffect(() => {
    console.log('useEffect triggered. Auth state:', { 
      isAuthenticated, 
      hasUser: !!user, 
      isLoading 
    });

    if (isAuthenticated && user && !isLoading) {
      console.log('Conditions met for user login handler');
      handleUserLogin();
    }
  }, [isAuthenticated, user, isLoading, handleUserLogin]);

  const handleLoginClick = () => {
    console.log('Login button clicked');
    loginWithRedirect({
      appState: { returnTo: "/home" }
    });
  };

  if (isLoading) {
    console.log('Auth0 is loading...');
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Auth0 error:', error);
    return <div>Authentication Error: {error.message}</div>;
  }

  if (isAuthenticated && user) {
    console.log('User is authenticated, redirecting to home');
    return <Navigate to="/home" />;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to BugHunt</h1>
        <p>Debug your way to the top!</p>
        <button 
          className="login-button" 
          onClick={handleLoginClick}
        >
          Login to Start
        </button>
      </div>
    </div>
  );
};

export default Login; 
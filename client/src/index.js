import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

console.log('Setting up Auth0Provider with redirect URI:', window.location.origin);

const onRedirectCallback = (appState) => {
  console.log('Auth0 redirect callback triggered', appState);
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname
  );
};

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-6jjadkywt5r7vivx.us.auth0.com"
      clientId="obHs9V2fQXchiUGXZhrjNRVGTVnOjtdS"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://dev-6jjadkywt5r7vivx.us.auth0.com/api/v2/",
        scope: "openid profile email"
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

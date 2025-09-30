import React, { useEffect } from 'react';

const SpotifyAuth = ({ onToken }) => {
  useEffect(() => {
    const hash = window.location.hash;
    let token = null;

    if (hash) {
      token = hash.split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
      onToken(token);  // Pass the token to the parent component
    }

    // Redirect to Spotify login if no token
    if (!token) {
      window.location.href = 'https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=token&redirect_uri=YOUR_REDIRECT_URI&scope=streaming%20user-read-email%20user-read-private';
    }
  }, [onToken]);

  return null; // This component doesn't need to render anything
};

export default SpotifyAuth;

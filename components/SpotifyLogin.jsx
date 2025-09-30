// src/components/spotifyLogin.jsx

import React from 'react';

const SpotifyLogin = () => {
  const handleLogin = () => {
    const clientId = 'ad094886b9114b24a3a7e4a6da953d35';
    const redirectUri = 'http://localhost:3000/callback';
    const scopes = 'streaming user-read-email user-read-private';

    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}`;
  };

  return (
    <button onClick={handleLogin} style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}>
      Login with Spotify
    </button>
  );
};

export default SpotifyLogin;

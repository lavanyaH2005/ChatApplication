// src/components/spotifyPlayer.jsx

import React, { useEffect } from 'react';

const SpotifyPlayer = ({ token }) => {
  useEffect(() => {
    if (!token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Web Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      player.connect();

      player.on('player_state_changed', state => {
        console.log(state);
      });
    };
  }, [token]);

  return <div id="spotify-player">Spotify Player Loaded</div>;
};

export default SpotifyPlayer;

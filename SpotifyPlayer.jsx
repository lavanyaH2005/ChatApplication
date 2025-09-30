import React, { useEffect, useState } from 'react';

const SpotifyPlayer = ({ token }) => {
  const [player, setPlayer] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [trackName, setTrackName] = useState('');

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'ChatAppPlayer',
        getOAuthToken: (cb) => { cb(token); },
        volume: 0.5
      });

      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;
        setTrackName(state.track_window.current_track.name);
        setIsPaused(state.paused);
      });

      spotifyPlayer.connect();
    };
  }, [token]);

  const togglePlay = () => {
    player.togglePlay();
  };

  return (
    <div>
      <h3>Currently Playing: {trackName}</h3>
      <button onClick={togglePlay}>
        {isPaused ? 'Play' : 'Pause'}
      </button>
    </div>
  );
};

export default SpotifyPlayer;

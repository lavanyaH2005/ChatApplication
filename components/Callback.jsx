// src/components/Callback.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = hash.split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
      localStorage.setItem('spotify_token', token);
      navigate('/'); // Redirect to home after login
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Callback;

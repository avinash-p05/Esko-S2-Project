import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MessageDisplay = () => {
  const [message, setMessage] = useState('loading....');

  useEffect(() => {
    axios.get('http://localhost:8081/api/v1/get-message')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        setMessage('There was an error fetching the message!');
        console.error('There was an error fetching the message!', error);
      });
  }, []);

  return (
    <div>
      <h2>Message from API:</h2>
      <h1>{message}</h1>
    </div>
  );
};

export default MessageDisplay;

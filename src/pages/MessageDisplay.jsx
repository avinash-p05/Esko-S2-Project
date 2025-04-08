import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MessageDisplay = () => {
  const [message, setMessage] = useState('');

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
      <h1>Message from API:</h1>
      <p>{message}</p>
    </div>
  );
};

export default MessageDisplay;

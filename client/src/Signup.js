// Signup.js

import React, { useState } from 'react';


export default function Signup() {
  const [form, setForm] = useState({
    username: '',
    nickname: '',
    password: '',
    email: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Signup failed:', errorResponse);
        throw new Error(`Signup failed: ${errorResponse.error}`);
      }
      // Handle success
    } catch (error) {
      // Handle errors
      setErrorMessage(error.message); // 또는 적절한 오류 메시지

    }
  };

  return (
    <div>
      <h2>Signup</h2>
      {<form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          required
        />
        <input
          type="text"
          name="nickname"
          value={form.nickname}
          onChange={handleChange}
          placeholder="Nickname"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          
        />
        
        <button type="submit">Signup</button>
      </form>
    }
    {errorMessage && <div className="error-message">{errorMessage}</div>}

    </div>
  );
}

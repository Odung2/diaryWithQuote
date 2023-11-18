// Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 임포트
import axios from 'axios';



export default function Login({setIsLoggedIn}) {
  const navigate = useNavigate(); // useNavigate 훅 사용

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    try {
      const response = await axios.post('/login', form);
      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        setIsLoggedIn(true); // 로그인 상태 설정
      }
      
    } catch (error) {
      // Handle errors
    }
    // Handle success
    navigate('/'); // 페이지 리디렉션
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

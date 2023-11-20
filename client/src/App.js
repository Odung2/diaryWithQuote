// export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import MyPage from './MyPage';
import styles from './App.module.css'; // CSS 파일 임포트


const App = () => {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [diaryEntry, setDiaryEntry] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // navigate('/');
  };
  // Fetch a random quote from the server
  const fetchQuote = async () => {
    try {
      const response = await axios.get('/api/quote');
      setQuote(response.data.quote);
      setAuthor(response.data.author);
    } catch (error) {
      console.error('Error fetching the quote', error);
    }
  };

  useEffect(() => {
    // 여기서 로컬 스토리지나 쿠키 등을 확인하여 로그인 상태를 결정합니다.
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Handle diary entry submission
  const submitDiaryEntry = async () => {
    // Implement the submission logic
    console.log('Diary Entry:', diaryEntry);
    console.log('Quote:', quote);
    // You would send this data to the server or store it in state
  };

  return (
    <Router>
      <div className={styles.container}>
        <nav className={styles.navBar}>
          <Link className={styles.navLink} to="/">Home</Link> |{ !isLoggedIn && <Link className={styles.navLink} to="/signup">Signup</Link>} {!isLoggedIn && <Link className={styles.navLink} to="/login">Login</Link>} {isLoggedIn && <Link className={styles.navLink} to="/mypage">My Page</Link>} {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
        </nav>
        <Routes>
          <Route path="/" element={
            <>
              <h1>My Diary</h1>
              <button className={styles.button} onClick={fetchQuote}>Get a Quote</button>
              <p>{quote} - {author}</p>
              <textarea
              className={styles.textarea}
                value={diaryEntry}
                onChange={(e) => setDiaryEntry(e.target.value)}
                placeholder="Write your diary entry here..."
              />
              <button className={styles.button} onClick={submitDiaryEntry}>Submit Entry</button>
            </>
          } />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div> 
    </Router>
  );
};

export default App;

// export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import MyPage from './MyPage';
import styles from './App.module.css'; // CSS 파일 임포트


const App = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [diaries, setDiaries] = useState([]);

  // const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // navigate('/');
  };


  const getPublicDiaries = async () => {
    try {
        // const to ken = localStorage.getItem('token');
        // if (!token) {
        //     // navigate('/login'); // 로그인 페이지로 리디렉션
        //     return;
        // }
        const response = await axios.get('/api/getPublicDiaries', {
            // headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            // headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(response.data); // 응답 로깅
        setDiaries(response.data);
    } catch (error) {
        console.error('Error fetching diaries', error);
    }
  };

  useEffect(() => {
    // 여기서 로컬 스토리지나 쿠키 등을 확인하여 로그인 상태를 결정합니다.
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    getPublicDiaries();
  }, []);

  return (
    <Router>
      <div className={styles.container}>
        <nav className={styles.navBar}>
          <Link className={styles.navLink} to="/">Home</Link> |{ !isLoggedIn && <Link className={styles.navLink} to="/signup">Signup</Link>} {!isLoggedIn && <Link className={styles.navLink} to="/login">Login</Link>} {isLoggedIn && <Link className={styles.navLink} to="/mypage">My Page</Link>} {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
        </nav>
        <Routes>
          <Route path="/" element={
            <>
              <h1>Diary With Quote</h1>
              <h3>당신의 하루를 멋진 명언으로!</h3>
              <h4>명언이 되는 일기, Diary With Quote.</h4>
              <h4>Diary With Quote에 담긴 아름다운 하루를 감상해 보세요.</h4>
              <h4>그리고 당신도 꺼내 보세요.</h4>
              <h4>그저 흘려보내던 일상 속 생각과 감성을.</h4>
              {/* <button className={styles.button} onClick={fetchQuote}>Get a Quote</button>
              <p>{quote} - {author}</p>
              <textarea
              className={styles.textarea}
                value={diaryEntry}
                onChange={(e) => setDiaryEntry(e.target.value)}
                placeholder="Write your diary entry here..."
              />
              <button className={styles.button} onClick={submitDiaryEntry}>Submit Entry</button> */}
              {diaries.map((diary, index) => (
                <div key={index} className={styles.diaryCard}>
                  <p className={styles.diaryDate}>
                      글쓴이 {diary.user.nickname} {new Date(diary.createdAt).toLocaleDateString()} 작성
                    </p>
                    <p className={styles.diaryText}>
                        {diary.text}
                    </p>
                    {diary.userQuotes && diary.userQuotes.length > 0 ? (
                        <div className={styles.quoteContainer}>
                            {/* 명언이 있는 경우 표시 */}
                            <p className={styles.quoteText}>
                              하루를 명언으로: "{diary.userQuotes[0].quote.text}"
                            </p>
                            
                        </div>
                    ) : (
                        <p></p>
                    )}
                </div>
            ))}
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

// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
// App.js
// import React, { useState } from 'react';
// import axios from 'axios';

// const App = () => {
//   const [quote, setQuote] = useState('');
//   const [author, setAuthor] = useState('');
//   const [diaryEntry, setDiaryEntry] = useState('');

//   // Fetch a random quote from the server
//   const fetchQuote = async () => {
//     try {
//       const response = await axios.get('/api/quote');
//       setQuote(response.data.quote);
//       setAuthor(response.data.author);
//     } catch (error) {
//       console.error('Error fetching the quote', error);
//     }
//   };

//   // Handle diary entry submission
//   const submitDiaryEntry = async () => {
//     // Implement the submission logic
//     console.log('Diary Entry:', diaryEntry);
//     console.log('Quote:', quote);
//     // You would send this data to the server or store it in state
//   };

//   return (
//     <div>
//       <h1>My Diary</h1>
//       <button onClick={fetchQuote}>Get a Quote</button>
//       <p>{quote} - {author}</p>
//       <textarea
//         value={diaryEntry}
//         onChange={(e) => setDiaryEntry(e.target.value)}
//         placeholder="Write your diary entry here..."
//       />
//       <button onClick={submitDiaryEntry}>Submit Entry</button>
//     </div>
//   );
// };

// export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';


const App = () => {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [diaryEntry, setDiaryEntry] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);


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
      <div>
        <nav>
          <Link to="/">Home</Link> |{ !isLoggedIn && <Link to="/signup">Signup</Link>} {!isLoggedIn && <Link to="/login">Login</Link>} {isLoggedIn && <Link to="/logout">Logout</Link>}
        </nav>
        <Routes>
          <Route path="/" element={
            <>
              <h1>My Diary</h1>
              <button onClick={fetchQuote}>Get a Quote</button>
              <p>{quote} - {author}</p>
              <textarea
                value={diaryEntry}
                onChange={(e) => setDiaryEntry(e.target.value)}
                placeholder="Write your diary entry here..."
              />
              <button onClick={submitDiaryEntry}>Submit Entry</button>
            </>
          } />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        </Routes>
      </div> 
    </Router>
  );
};

export default App;

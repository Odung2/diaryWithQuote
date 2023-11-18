import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
const navigate = useNavigate();

const [userInfo, setUserInfo] = useState({ username: '', nickname: '', email: '' });
const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
const [diaryEntry, setDiaryEntry] = useState('');

useEffect(() => {
// 사용자 정보를 불러오는 함수
    const fetchUserInfo = async () => {

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login'); // 로그인 페이지로 리디렉션
                return;
            }
            const response = await axios.get('/api/user-info', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserInfo(response.data);
            setIsLoading(false); // 데이터 로딩 완료
        } catch (error) {
            console.error('Error fetching user info', error);
            navigate('/login'); // 로그인 페이지로 리디렉션
        }
    };

    fetchUserInfo();
}, [navigate]);

const submitDiaryEntry = async () => {
try {
    await axios.post('/api/diaries', { text: diaryEntry }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    // Diary entry submission success logic
    setDiaryEntry('');
} catch (error) {
    console.error('Error submitting diary entry', error);
}
};

if (isLoading) {
    return <div>Loading...</div>;
}

return (
    <div>
        <h1>My Page</h1>
        <h2>User Info</h2>
        <p>Username: {userInfo.username}</p>
        <p>Nickname: {userInfo.nickname}</p>
        <p>Email: {userInfo.email || 'Not provided'}</p>
        <h2>My Diary</h2>
        <textarea value={diaryEntry} onChange={(e) => setDiaryEntry(e.target.value)} />
        <button onClick={submitDiaryEntry}>Submit Entry</button>
    </div>
);
};

export default MyPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './MyPage.module.css'; // CSS 파일 임포트

const MyPage = () => {
const navigate = useNavigate();

const [userInfo, setUserInfo] = useState({ username: '', nickname: '', email: '' });
const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
const [diaryEntry, setDiaryEntry] = useState('');
const [diaries, setDiaries] = useState([]);

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
    const fetchDiaries = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login'); // 로그인 페이지로 리디렉션
                return;
            }
            const response = await axios.get('/api/getDiaries', {
                // headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // console.log(response.data); // 응답 로깅
            setDiaries(response.data);
        } catch (error) {
            console.error('Error fetching diaries', error);
        }

    };

    fetchUserInfo();
    fetchDiaries();
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

const createQuoteForDiary = async (diaryId, diaryText) => {
    try {
        // 서버에 명언 생성 요청 보내기
        const response = await axios.post('/api/createQuote', { diaryId, diaryText });

        // 성공적으로 명언이 생성되고 연결되었다는 메시지 처리
        console.log(response.data.message);
        // 추가적인 로직 (예: 상태 업데이트, 사용자에게 알림 등)
    } catch (error) {
        console.error('Error creating quote:', error);
        // 에러 처리 로직
    }
};


if (isLoading) {
    return <div>Loading...</div>;
}

return (    
    <div className={styles.myPageContainer}>
        <h1 className={styles.myPageHeader}>My Page</h1>
        <div className={styles.userInfoContainer}>
        <div className={styles.userInfoRow}>
            <span className={`material-icons ${styles.userInfoIcon}`}>account_circle</span>
            <span className={styles.userInfoLabel}>아이디: </span>
            <span className={styles.userInfoText}>{userInfo.username}</span>
        </div>
        <div className={styles.userInfoRow}>
            <span className={`material-icons ${styles.userInfoIcon}`}>face</span>
            <span className={styles.userInfoLabel}>별명: </span>
            <span className={styles.userInfoText}> {userInfo.nickname}</span>
        </div>
        <div className={styles.userInfoRow}>
            <span className={`material-icons ${styles.userInfoIcon}`}>email</span>
            <span className={styles.userInfoLabel}>이메일: </span>
            <span className={styles.userInfoText}> {userInfo.email || 'Not provided'}</span>
        </div>
    </div>
        <h2>오늘의 일기 작성하기</h2>
        <textarea
            className={styles.diaryTextarea} 
            value={diaryEntry} onChange={(e) => setDiaryEntry(e.target.value)} />
        <button className={styles.submitButton} onClick={submitDiaryEntry}>작성 완료!</button>
        <h2>나의 일기</h2>
        <div className={styles.diaryList}>
        {diaries.map((diary, index) => (
            <div key={index} className={styles.diaryCard}>
            <p className={styles.diaryDate}>
                {new Date(diary.createdAt).toLocaleDateString()} 작성
            </p>
            <p className={styles.diaryText}>
                {diary.text}
            </p>
            {!diary.userQuotes?.length && (
                <button 
                    className={styles.createQuoteButton}
                    onClick={() => createQuoteForDiary(diary.id, diary.text)}
                >
                    명언 만들기
                </button>
            )}
            </div>
        ))}
        </div>
    </div>
);
};

export default MyPage;

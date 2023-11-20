// server.js

const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();


const prisma = new PrismaClient();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// 토큰 검증 및 사용자 ID 추출 함수
const verifyTokenAndGetUserId = (token) => {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

async function isUsernameTaken(username) {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  return user !== null;
}

app.use(express.json());

// 회원가입
app.post('/signup', async (req, res) => {
  const { username, nickname, email, password } = req.body;

  // `username` 중복 검사
  if (await isUsernameTaken(username)) {
    return res.status(400).json({ error: "Username is already taken." });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        nickname,
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ user });
  } catch (error) {
    console.error(error);

    res.status(400).json({ error: "User could not be created." });

  }
});

// 로그인
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    // 사용자 인증 검증
    if (user && await bcrypt.compare(password, user.password)) {
      // JWT 생성 (비밀키와 함께)
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // 로그인 성공 응답 및 토큰 전송
      res.status(200).json({ token });
    } else {
      // 인증 실패 응답
      res.status(401).send('인증 실패: 사용자가 존재하지 않거나 비밀번호가 잘못되었습니다.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

app.get('/api/user-info', async (req, res) => {
  // 사용자 인증 (토큰 검증 등)
  // ...
  try {
    const token = req.headers.authorization.split(' ')[1]; // 'Bearer [Token]' 형식 가정
    const userIdFromToken = verifyTokenAndGetUserId(token);

    const user = await prisma.user.findUnique({
      where: { id: userIdFromToken },
      select: { username: true, nickname: true, email: true }
    });

    if (!user) {
      return res.status(404).send('User not found');
    }
    // console.log('User ID from Token:', userIdFromToken); // 로그 추가
    // console.log('Fetched User:', user); // 로그 추가
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(401).send('Unauthorized');
  }
});

app.post('/api/diaries', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // 'Bearer [Token]' 형식 가정
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userIdFromToken = decoded.userId;

    const { text } = req.body;
    const diary = await prisma.diary.create({
      data: {
        text,
        userId: userIdFromToken, // 사용자 ID를 diary 데이터와 연결
        isPublic: false // 기본값을 false로 설정
      }
    });

    res.status(201).json(diary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

app.get('/api/getDiaries', async (req, res) => {
  // 요청에 포함된 사용자의 토큰을 사용하여 사용자 인증 및 ID 확인
  try {
    const token = req.headers.authorization.split(' ')[1]; // 'Bearer [Token]' 형식 가정
    const userIdFromToken = verifyTokenAndGetUserId(token);

    const user = await prisma.user.findUnique({
      where: { id: userIdFromToken },
      select: { username: true, nickname: true, email: true }
    });
    if (!user) {
      return res.status(404).send('User not found');
    }
  
      // Prisma를 사용하여 데이터베이스에서 사용자의 일기 조회
    const diaries = await prisma.diary.findMany({
      where: { userId: userIdFromToken },
      select: { text: true, createdAt: true, userQuotes: true}
    });

    // console.log(diaries);
    res.json(diaries);
  } catch (error) {
      res.status(500).send({error: 'Server error'});
  }

});

// 명언 생성 및 일기에 연결하는 API 라우트
app.post('/api/createQuote', async (req, res) => {
  const { diaryId, diaryText } = req.body;
  
  try {
    // 사용자 인증
    const token = req.headers.authorization.split(' ')[1];
    const userId = jwt.verify(token, process.env.JWT_SECRET).userId;

    // // 간단한 명언 생성 로직 (여기서는 미리 정의된 명언을 선택)
    // const quoteText = "명언 예시 - 유명인"; // 실제 구현에서는 명언 생성 로직을 사용
    // const quote = await prisma.quote.create({
    //   data: { text: quoteText, author: "유명인" }
    // });

    // // 생성된 명언을 일기에 연결
    // await prisma.userQuote.create({
    //   data: {
    //     userId: userId,
    //     quoteId: quote.id,
    //     diaryId: diaryId
    //   }
    // });

    // res.status(201).send("명언이 생성되었습니다.");

    exec(`python diarywithquoteml1.py "${diaryText}"`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send({error: 'Error generating quote'});
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).send({error: 'Error generating quote'});
      }
  
      // Python 스크립트의 출력에서 명언 추출
      const quoteText = stdout.trim();
      // 명언을 데이터베이스에 저장하고 일기와 연결
      try {
        const quote = await prisma.quote.create({
          data: { text: quoteText }
        });
  
        await prisma.userQuote.create({
          data: {
            diaryId,
            quoteId: quote.id
          }
        });
  
        res.status(201).json({ quote: quoteText });
      } catch (dbError) {
        console.error(dbError);
        res.status(500).send({error: 'Error saving quote to database'});
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});


// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

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
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

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

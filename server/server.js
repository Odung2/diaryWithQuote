// server.js

const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
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

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // 로그인 성공 처리 (토큰 발행 등) 필요
    res.status(200).json({ message: "Login successful!" });
  } catch (error) {
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

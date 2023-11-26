const express = require('express');
const { PrismaClient } = require('@prisma/client');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const { exec } = require('child_process');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// const verifyTokenAndGetUserId = (token) => {
//     if (!token) {
//         throw new Error('No token provided');
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         // console.log(decoded);
//         // console.log(decoded.id);
//         return decoded.id;
//     } catch (error) {
//         throw new Error('Invalid token');
//     }
// };

router.get('/user-info', authMiddleware, async (req, res) => {
    // 사용자 인증 (토큰 검증 등)
    // ...
    try {
        // const token = req.headers.authorization.split(' ')[1]; // 'Bearer [Token]' 형식 가정
        // // console.log(token);
        // const userIdFromToken = verifyTokenAndGetUserId(token);
      // console.log(userIdFromToken);
        const userIdFromToken = req.userId;
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

router.post('/diaries', authMiddleware, async (req, res) => {
    try {
    // const token = req.headers.authorization.split(' ')[1]; // 'Bearer [Token]' 형식 가정
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const userIdFromToken = verifyTokenAndGetUserId(token);
    const userIdFromToken = req.userId;
    // console.log(decoded);
    console.log(userIdFromToken);
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

router.get('/getDiaries', authMiddleware, async (req, res) => {
    // 요청에 포함된 사용자의 토큰을 사용하여 사용자 인증 및 ID 확인
    try {
    // const token = req.headers.authorization.split(' ')[1]; // 'Bearer [Token]' 형식 가정
    // const userIdFromToken = verifyTokenAndGetUserId(token);
    const userIdFromToken = req.userId;
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
        select: { text: true, createdAt: true, userQuotes: {
        include: {
            quote: true // `quote` 객체 포함
        }
        }, id: true, userId: true, isPublic: true}
    });

    // console.log(diaries);
    res.json(diaries);
    } catch (error) {
        res.status(500).send({error: 'Server error'});
    }

});

// 명언 생성 및 일기에 연결하는 API 라우트
router.post('/createQuote', async (req, res) => {
    const { diaryId, diaryText, userId } = req.body;
    
    try {
    // 사용자 인증
    // const token = req.headers.authorization.split(' ')[1];
    // const userId = jwt.verify(token, process.env.JWT_SECRET).id;

    exec(`python diarywithquoteml1.py "${diaryText}"`, async (error, stdout, stderr) => {
        // const stdout = stdoutBuffer.toString('utf-8');

        // console.log('stdout:', stdout);
        // console.error('stderr::::', stderr);
        if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send({error: 'Error generating quote'});
        }
        if (stderr) {
        console.error(`stderr: ${stderr}`);
        // return res.status(500).send({error: 'Error generating quote'});
        }
    
        // Python 스크립트의 출력에서 명언 추출
        const lines = stdout.trim().split('\n');
        // const quoteText = lines[lines.length - 1];
        const quoteText = Buffer.from(lines[lines.length - 1], 'utf-8').toString();
        console.log(quoteText);
        // 명언을 데이터베이스에 저장하고 일기와 연결
        try {
        const quote = await prisma.quote.create({
            data: { text: quoteText }
        });
    
        await prisma.userQuote.create({
            data: {
            diaryId: diaryId,
            quoteId: quote.id,
            userId: userId,
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

router.patch('/diaries/setpublic', authMiddleware, async (req, res) => {
    // const diaryId = parseInt(req.params.diaryId);
    const { diaryId, isPublic } = req.body;

    try {
        const updatedDiary = await prisma.diary.update({
            where: { id: diaryId },
            data: { isPublic: isPublic }
        });

        res.json(updatedDiary);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error while updating diary' });
    }
});

router.get('/getPublicDiaries', async (req, res) => {
    try {

    const diaries = await prisma.diary.findMany({
        where: { isPublic: true },
        select: { text: true, createdAt: true,
        user: {
            select: { nickname: true } // `user` 객체의 `nickname` 포함
        }, 
        userQuotes: {
            include: {
                quote: true // `quote` 객체 포함
            }
        }, id: true, userId: true, isPublic: true}
    });
    res.json(diaries);
    } catch (error) {
        res.status(500).send({error: 'Server error'});
    }

});

module.exports = router;
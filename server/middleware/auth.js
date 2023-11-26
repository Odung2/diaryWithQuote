const jwt = require('jsonwebtoken');

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

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // const token = req.headers.authorization.split(' ')[1]; // 'Bearer [Token]' 형식 가정
    // console.log("token 검사 중입니다!!!!!!!!!!");
    if (!authHeader) {
        return res.status(401).send({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // 'Bearer TOKEN' 형식 가정

    // JWT 검증
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Failed to authenticate token' });
        }

        // 검증 성공, 사용자 ID를 req 객체에 추가
        req.userId = decoded.id;
        next();
    });
};

module.exports = authMiddleware;
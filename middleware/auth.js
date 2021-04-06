const { User } = require('../models/User')
let auth = (req, res, next) => {
    // 인증처리를 하는 곳

    // 클라이언트 쿠키에서 토큰을 가져온다
    let token = req.cookies.x_auth

    // 토큰을 복호화 한 후 유저를 찾는다
    User.findByToken(token, (err,user) => {
        if(err) throw err
        if(!user) return res.json({ isAuth: false, error: true })

        // 리퀘스트에 토큰, 유저 정보를 넣어줌
        req.token = token
        req.user = user
        // 그래야 미들웨어에서 다음으로 넘어감 
        next()
    })

    // 유저가 있으면 인증 Okay

    // 유저가 없으면 인증 No!

}

module.exports = { auth }

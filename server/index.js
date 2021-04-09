// express module 가져와서 app 만듬
const express = require('express')
const app = express()
const port = 5000
const { User } = require('./models/User')
const { auth } = require('./middleware/auth')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require("./config/key")

// body parser 에 옵션을 주는 것 (각각의 form 으로 된 data 를 가져와서 분석 할 수 있도록)
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
    useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : true, useFindAndModify : false
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err))

app.get('/',(req,res)=>res.send('Hello World'))

// 회원가입에 필요한 정보들을 client 에서 가져오면 그것들을 데이터베이스에 넣어준다
app.post('/api/users/register',(req,res) => {
  // req.body 에는 json 형식으로 데이터가 들어있음
  // 위에 Body parser 가 있기 때문에 (req body 이용해서 정보 받는게 가능 from clinet to server)
  const user = new User(req.body)
  // 받은 정보를 mongo db 의 user 모델에 저장
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/users/login',(req,res) => {
  // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email },(err,user) => {
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "이메일에 해당되는 유저가 없습니다."
      })
    }
    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인.
    user.comparePassword(req.body.password,(err,isMatch)=>{
      if(!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})
    
      // 비밀번호 까지 맞다면 토큰을 생성하기
      user.generateToken((err,user) => {
        if(err) return res.status(400).send(err)

        // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
        res.cookie("x_auth",user.token)
        .status(200)
        .json({ loginSuccess: true, userId: user._id })

      })


    })

  })

})

app.get('/api/users/auth', auth ,(req,res) => {
  // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication 이 true 라는 말.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true, // role 이 0이 아니면 관리자, 0 이면 일반 유저
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req,res) => {
  User.findOneAndUpdate({ _id: req.user._id }, 
    { token: "" },
    (err, user) => {
      if(err) return res.json({ success: false, err })
      return res.status(200).send({
        success: true
      })
    })
})

app.listen(port,()=>console.log(`Example app listening on port ${port}`))



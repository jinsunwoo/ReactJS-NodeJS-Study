const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

// 스키마 생성
const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// parameter 로 next 를 갖고 있다가 
userSchema.pre('save', function(next) {
    // this : 전달받은 위의 정보 
    var user = this

    // 비밀번호가 변경될때만 암호화 진행 (다른 필드 변경될 때는 이 작업 반복 할 필요 없으니까)
    if(user.isModified('password')) {
        // 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)
            // user.password = 전달받은 ex) 12345
            // 해당 password 에 salt 를 뿌려서 hash 만들어 줌
            bcrypt.hash(user.password, salt, function(err, hash) {
                // 패스워드를 hashed 패스워드로 바꿔줌
                if(err) return next(err)
                user.password = hash
                // index.js 에서 user.save 가 next 임
                next()
            });
        });
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword,cb) {
    // plain password : 12345, encrypted password in db : $2b$10$yMT240cAlAcMMPsctsNFIOmB43euf5lRfr.5xkXmfJZ3En5huCp/m
    bcrypt.compare(plainPassword,this.password,function(err,isMatch){
        if(err) return cb(err)
        cb(null,isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    // json webtoken 이용해서 token 생성하기
    // token = user._id + 'secretToken
    var token = jwt.sign(user._id.toHexString(),'secretToken')

    user.token = token
    user.save(function(err,user){
        if(err) return cb(err)
        cb(null,user)
    })

}

userSchema.statics.findByToken = function(token,cb) {
    var user = this;
    // 토큰을 decode 한다.
    jwt.verify(token,'secretToken',function(err,decoded) {
        // 유저 아이디를 이용해서 유저를 찾은 다음에 
        // 클라이언트에서 가져온 토큰과 데이터베이스에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id": decoded, "token": token}, function(err,user){
            if(err) return cb(err)
            cb(null,user)
        })

    })

}

// 스키마를 model 로 감싸준다
const User = mongoose.model('User',userSchema)
// 이 모델은 다른 곳에서도 쓸 수 있게 export
module.exports = { User }
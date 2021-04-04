const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10

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
        maxlength: 5
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

userSchema.pre('save', function(next) {
    var user = this

    // 비밀번호가 변경될때만 암호화 진행 (다른 필드 변경될 때는 이 작업 반복 할 필요 없으니까)
    if(user.isModified('password')) {
        // 비밀번호를 암호화 시킨다.
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if(err) return next(err)
        bcrypt.hash(user.password, salt, function(err, hash) {
            // 패스워드를 hashed 패스워드로 바꿔줌
            if(err) return next(err)
            user.password = hash
            // index.js 에서 user.save 가 next 임
            next()
        });
    });
    }
})

// 스키마를 model 로 감싸준다
const User = mongoose.model('User',userSchema)
// 이 모델은 다른 곳에서도 쓸 수 있게 export
module.exports = { User }
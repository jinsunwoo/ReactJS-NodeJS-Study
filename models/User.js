const mongoose = require('mongoose')
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
    passwkrd: {
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

// 스키마를 model 로 감싸준다
const User = mongoose.model('User',userSchema)
// 이 모델은 다른 곳에서도 쓸 수 있게 export
module.exports = { User }
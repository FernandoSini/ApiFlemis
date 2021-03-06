const mongoose = require("mongoose")
const uuidv1 = require("uuidv1") //caso dê algum erro no uuid, deve trocar const por let ou então tentar essa solução const { v1: uuidv1 } = require('uuid');
const crypto = require("crypto") //modulo responsavel por encriptografar as senhas
const { type } = require("os");
const { ObjectId } = mongoose.Schema;
// const Post = require('./post')
//teste pra poder adicionar no git
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true,
    },
    firstname: {
        type: String,
        trim: true,
        required: true,
    },
    lastname: {
        type: String,
        trim: true,
        required: true,
    },
    birthday: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["MALE", "FEMALE", "NONBINARY"],
        default: "MALE"
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    hashed_password: {
        type: String,
        trim: true,
        required: true,
    },
    salt: String,// permite gerar string randomicamentee
    avatar_profile: {
        type: ObjectId,
        ref: "Avatar"
    },
    about: {
        type: String,
        trim: true,
    },
    usertype: {
        type: String,
        enum: ["FREE", "PRO"],
        default: "FREE"
    },
    job: {
        type: String,
        trim: true,
    },
    company: {
        type: String,
        trim: true,
    },
    school: {
        type: String,
        trim: true
    },
    livesIn: {
        type: String,
        trim: true,
    },
    photos: [{
        type: ObjectId,
        ref: "UserPhoto"
    }],
    resetPasswordLink: {
        data: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    likesSent: [{
        type: ObjectId,
        ref: "User"
    }],
    likesReceived: [{
        type: ObjectId,
        ref: "User"
    }],
    matches: [{
        type: ObjectId,
        ref: "Match"
    }],
    eventsGoing: [{
        type: ObjectId,
        ref: "Event"
    }],
    eventsCreated: [{
        type: ObjectId,
        ref: "Event"
    }],
    role: {
        type: String,
        enum: ["user", "admin", "moderator"],
        default: "user"
    }
});

/* 
Iremos usar campos virtuais, que são no caso campos adicionais para modelos determinados,
os valores deles podem ser configurados manualmente ou automaticamente, dependendo da funcionalidade,
OS MODELOS VIRTUAIS(password) NÃO SÃO PERSISTIDOS NO BANCO DE DADOS ELES SÓ EXISTEM LOGICAMENTE E NÃO SÃO ESCRITOS NAS COLEÇÇÕES DOS DOCUMENTOS.
*/

userSchema.virtual("password")
    .set(function (password) {
        //criando uma variavel temporaria password
        this._password = password;
        //gerando um timestamp
        this.salt = uuidv1()
        //criptografando a senha
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        //retornar a senha
        return this._password;
    })

//metodos para o schema, que será usado para registrar o usuário pela primeira vez.
userSchema.methods = {
    //adicionando o metodo para autenticar, plain text será a senha(que virá do controller), e
    authenticate: function (plainText) {

        //verificar se a criptografia bate com a senha encriptografada/salva no banco
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    //adicionando o metodo para encriptografar a senha:
    encryptPassword: function (password) {
        if (!password) return "";

        try {
            //tentando encriptografar
            return crypto.createHmac('sha256', this.salt)
                .update(password).digest("hex");

        } catch (error) {

            return "";

        }
    },
    //pre middleware usado parar remover dados do usuario quando ele for deletado
    //isso irei adicionar depois flemis

}
module.exports = mongoose.model("User", userSchema);
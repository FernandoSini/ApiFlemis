const mongoose = require("mongoose")
const uuidv1 = require("uuidv1") //caso dê algum erro no uuid, deve trocar const por let ou então tentar essa solução const { v1: uuidv1 } = require('uuid');
const crypto = require("crypto") //modulo responsavel por encriptografar as senhas
const { type } = require("os");
const { matches } = require("lodash");
const { ObjectId } = mongoose.Schema;
// const Post = require('./post')
//teste pra poder adicionar no git

const userSchema = new mongoose.Schema({
    name: {
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
        unique: true,
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
        data: Buffer, // envio das imagens em forma binaria, e será armazenado e convertido no content type
        contentType: String,
    },
    about: {
        type: String,
        trim: true,
    },
    resetPasswordLink: {
        data: String,
        default: ""
    },
    likesSent: [{ type: ObjectId, ref: "User" }],
    likesReceived: [{ type: ObjectId, ref: "User" }],
    role: {
        type: String,
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
            console.log(error);
            return "";

        }
    },
    //pre middleware usado parar remover dados do usuario quando ele for deletado
    //isso irei adicionar depois

}
module.exports = mongoose.model("User", userSchema);
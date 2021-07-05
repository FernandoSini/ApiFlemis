const express = require("express")
const mongoose = require("mongoose")
const server = express()
const morgan = require("morgan")
const bodyParser = require("body-parser")
const expressValidator = require("express-validator")
var cookieParser = require("cookie-parser")
const dotenv = require("dotenv")
const fs  = require("fs")
dotenv.config()
// const cors = require("cors")

//conectando no mongo
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false, useCreateIndex:true}, )
.then(()=>{console.log("connection sucessful")})

//mostrar o erro no banco de dados se tentarmos usar duas vezes
mongoose.connection.on("error", err =>{
    console.log(`Error in your connection: ${err.message}`);
});



const port = process.env.PORT || 8080;
server.listen(port, ()=> console.log(`Server running on port: ${port}`))

const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server)
const morgan = require("morgan")
const bodyParser = require("body-parser")
const expressValidator = require("express-validator")
var cookieParser = require("cookie-parser")
const dotenv = require("dotenv")
const fs = require("fs")
dotenv.config()
// const cors = require("cors")
//isso aqui foi adicionado junto a pasta public
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'public'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html');
app.use(morgan("dev"))
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

//conectando no mongo
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true },)
    .then(() => { console.log("connection sucessfully") })

//mostrar o erro no banco de dados se tentarmos usar duas vezes
mongoose.connection.on("error", err => {
    console.log(`Error in your connection: ${err.message}`);
});

/*app.use("/", (req, res) => {
    return res.status(404).json({ error: "erro" })
})*/
/*//isso aqui foi adicionado
app.use("/socket", (req, res) => {
    return res.render("index.html");
})*/

let messages = []
io.on("connection", socket => {
    console.log("socket id" + socket.id);

    socket.emit("previousMessage", messages)

    socket.on('sendMessage', data => {
        messages.push(data);
        socket.broadcast.emit('receivedMessage', data)
    });
})


app.use(function (req, res, next) {
    /* res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");*/
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});


app.use((err, req, res, next) => {
    console.log(err.stack);
    if (res.statusCode === 400) {
        return res.status(400).json({ error: "Bad Request!" })
    }
    if (res.statusCode === 401) {
        return res.status(401).json({ error: "Unauthorized!" })
    }
    if (res.statusCode === 403) {
        return res.status(403).json({ error: "Forbidden! You Need the permission to do that!" })
    } if (res.statusCode === 404) {
        return res.status(404).json({ error: "Not found!" })
    }

    if (res.statusCode === 500) {
        return res.status(500).json({ error: "Internal Server Error" })
    }
    if (res.statusCode === 502) {
        return res.status(502).json({ error: "Bad Gateway" })
    }
    next()


})


const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`Server running on port: ${port}`))

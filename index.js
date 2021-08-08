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
const rotasAuth = require("./routes/auth")
const rotasUser = require("./routes/user")
const rotasEvents = require("./routes/event")
// const cors = require("cors")
//isso aqui foi adicionado junto a pasta public
// app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'public'))
// app.engine('html', require('ejs').renderFile)
// app.set('view engine', 'html');


//conectando no mongo
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true },)
    .then(() => { console.log("connection sucessfully") })

//mostrar o erro no banco de dados se tentarmos usar duas vezes
mongoose.connection.on("error", err => {
    console.log(`Error in your connection: ${err.message}`);
});

// app.get("/", (req, res) => {
//     return res.status(404).json({ error: "erro" })
// })
//isso aqui foi adicionado
// app.get("/socket/app", (req, res) => {
//     return res.render("index.html");
// })

let messages = []
// io.of("/fodase").on("connection", socket => {
//     console.log("socket id" + socket.id);

//     socket.emit("previousMessage", messages)

//     socket.on('sendMessage', msg => {
//         messages.push(msg);
//         socket.emit('receivedMessage', m)
//     });
// })

// var clients = {}
// io.of("/fodase").on("connection", (socket) => {
//     console.log("connetetd");
//     console.log(socket.id, "has joined");
//     socket.on("signIn", (id) => {
//         console.log(id);
//         clients[id] = socket;
//         console.log(clients);
//     });
//     socket.on("sendMessage", (msg) => {
//         console.log(msg);
//         let targetId = msg.targetId;
//         if (clients[targetId]) clients[targetId].emit("sendMessage", msg);
//     });
// });



app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

app.use(morgan("dev"))
app.use(expressValidator())
app.use(express.Router())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.use("/", rotasAuth)
app.use("/", rotasUser)
app.use("/", rotasEvents)


app.use((err, req, res, next) => {
    console.log(err)
    if (err.status === 400) {
        return res.status(400).json({ error: "Bad Request!" })
    }
    if (err.status === 401) {
        console.log(err)
        return res.status(401).json({ error: "Unauthorized!" })
    }
    if (err.status === 403) {
        return res.status(403).json({ error: "Forbidden! You Need the permission to do that!" })
    } if (err.status === 404) {
        return res.status(404).json({ error: "Not found!" })
    }

    if (err.status === 500) {
        return res.status(500).json({ error: "Internal Server Error" })
    }
    if (err.status === 502) {
        return res.status(502).json({ error: "Bad Gateway" })
    }

    if (err.status === undefined) {
        return res.json(err);
    }


})
// app.use(function (err, req, res, next) {
//     console.log(err.statusCode)
//     console.log(err.status)
//     if (err.name === "UnauthorizedError") {
//         res.status(401).send({ error: "Unauthorized!" })

//     }
// })


const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port: ${port}`))

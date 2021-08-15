const User = require("../models/user")
const Match = require("../models/match")
// const app = express()
// const server = require("http").createServer(app)
// const io = require("socket.io")(server)

exports.getMatchesByUserId = (req, res) => {
    Match.find({ $or: [{ user1: req.profile._id }, { user2: req.profile._id }] })
        .populate("user2", "username lastname firstname")
        .populate("user1", "username lastname firstname")
        .exec((err, matches) => {
            if (err) {
                return res.status(400).json(err)
            } else {
                console.log(matches)
                // matches.forEach(element=> {
                //     console.log(element)
                // })
                return res.status(200).json(matches)
            }

        })

}

// exports.MatchChat = (req, res) => {
//     // res.redirect("/fodase")

//     var io = req.app.get("socketio")
//     // console.log(io);
//     // console.log(io.on)
//     var clients = {}
//     io.of("/api/match/chat").on("connection", (socket) => {
//         console.log("connected");
//         console.log(socket.id, "has joined");
//         // socket.
//         socket.on("signIn", (id) => {
//             console.log(id);
//             clients[id] = socket;
//             // console.log(clients);
//         });
//         socket.on("sendMessage", (msg) => {
//             console.log(msg);
//             let targetId = msg.targetId;
//             let senderId = msg.senderId;
//             // console.log(clients)
//             if (clients[targetId]) clients[targetId].emit("sendMessage", msg);
//         });
//     });
//     // console.log("maconha" + io)
//     // console.log(io.on("connection", (socket) => { }))
//     // io.on("connection", (socket) => {
//     //     console.log("aqui")
//     //     console.log(socket.id, "Connected")
//     // })

// }


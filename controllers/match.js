const User = require("../models/user")
const Match = require("../models/match")
// const app = express()
// const server = require("http").createServer(app)
// const io = require("socket.io")(server)

exports.getMatchesByUserId = (req, res) => {

    Match.find({ $or: [{ user1: req.profile._id }, { user2: req.profile._id }] })
        // .populate("user2", "username lastname firstname avatar_profile")
        .populate({
            path: "user2", populate: {
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            },
            select:
                "-email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -photos -usertype -role -birthday -createdAt -about -livesIn -job -company -school -salt -hashed_password -__v"

        })
        .populate({
            path: "user1", populate: {
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            },
            select:
                "-email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -photos -usertype -role -birthday -createdAt -about -livesIn -job -company -school -salt -hashed_password -__v"

        })
        .populate("messages", "from content target message_status timestamp")
        // .populate("user1", "username lastname firstname avatar_profile")
        .exec((err, matches) => {
            if (err) {
                return res.status(400).json(err)
            }
            if (!matches.length) {
                return res.status(404).json({ error: "Not found matches with you" })
            }

            return res.status(200).json(matches)


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


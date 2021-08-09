const User = require("../models/user")
const Match = require("../models/match")

exports.getMatchesByUserId = (req, res) => {
    console.log(req.profile)
    Match.find({ user2: req.profile._id })
        .populate("user2", "username lastname firstname")
        .populate("user1", "username lastname firstname")
        .exec((err, matches) => {
            if (err) {
                return res.status(400).json(err)
            } else {
                console.log(matches)
                return res.status(200).json(matches)
            }

        })

}
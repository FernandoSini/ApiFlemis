const User = require('../models/user')
const _ = require("lodash")
const jwt = require("jsonwebtoken")
const expressJwt = require("express-jwt")


exports.register = async (req, res) => {

    const emailExists = await User.findOne({ email: req.body.email })
    const userNameExists = await User.findOne({username: req.body.username})

    if (emailExists||userNameExists) {
        return res.status(403).json({
            error: "User already exists because this email or username is in use"
        })
    }

    const newUser = await new User(req.body);
    await newUser.save();
    return res.status(200).json( { message: "User registered successfully! Please make Login!" })
}

exports.login = (req, res) => {

    const { emailUser, password } = req.body;
    User.findOne({ email: emailUser }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: "User with this email not found. Please register!" })
        }
    })

    if (!user.authenticate(password)) {
        return res.status(401).json({ error: "Email and password not found" })
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET)
    res.cookie("token", token, { expire: new Date() + 9999 });
    const { _id, username, firstname, lastname, birthday, gender, roleUser, email, avatar_profile, about, usertype, job, livesin, school, company, photos, role } = user;

    return res.json({ token, user: { _id, username, firstname, lastname, birthday, gender, roleUser, email, avatar_profile, about, usertype, job, livesin, school, company, photos, role } })
}
exports.requireLogin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth",
    algorithms: ['HS256']
})
exports.logout = (req, res) => {
    res.clearCookie("token");

    return res.json({ message: "Logout successfully" })
}


const User = require('../models/user')
const _ = require("lodash")
const jwt = require("jsonwebtoken")


exports.register = async (req, res) => {

    const userExists = await User.findOne({ email: req.body.email })

    if (userExists) {
        return res.status(403).json({
            error: "User already exists because this email is in use"
        })
    }

    const newUser = await new User(req.body);
    await newUser.save();
    return res.status(200).json({ message: "User registered successfully! Please make Login!" })
}

exports.login = (req, res) => {

    const { email, password } = req.body;
    User.findOne({ email: email}, (err,user)=>{
        if(err|| !user){
            return res.status(401).json({error:"User with this email not found. Please register!"})
        }
    })

    if(!user.authenticate(password)){
        return res.status(401).json({error:"Email and password not found"})
    }
    
    const token = jwt.sign({_id:user._id, role:user.role}, process.env.JWT_SECRET)
    //res.cookie(token)
}
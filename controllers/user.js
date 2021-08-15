const User = require("../models/user")
const multer = require("multer")
const uuid = require("uuidv1")
const formidable = require("formidable")
const fs = require("fs")
const _ = require("lodash")
const path = require("path")
const Avatar = require("../models/avatar")


exports.userById = (req, res, next, id) => {
    User.findById(id)
        .populate("likesSent", "_id username avatar_profile")
        .populate("likesReceived", "_id username avatar_profile")
        .populate("avatar_profile", "path filename contentType")
        .exec((err, user) => {
            if (err) {
                return res.satus(400).json({ error: "User not found" })
            }
            //criando o objeto profile com as infos do usuario
            // user.hashed_password = undefined;
            // user.salt = undefined;
            req.profile = user;
            next()
        });
}
exports.targetUserById = (req, res, next, id) => {
    User.findById(id)
        .populate("likesSent", "_id username avatar_profile")
        .populate("likesReceived", "_id username avatar_profile")
        .exec((err, targetUser) => {
            if (err) {
                return res.status(400).json({ error: "User not found" })
            }
            //criando o objeto profile com as infos do usuario
            req.userTarget = targetUser;
            req.userTarget.hashed_password = undefined;
            req.userTarget.salt = undefined;
            next()
        });
}
exports.getUserProfile = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    console.log(req.profile)
    return res.status(200).json(req.profile)
}

const avatarStorage = multer.diskStorage({
    destination: "./uploads/user/avatar",
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname));
        //se não der certo vamos usar
        //cb(null, Date.now()+".jpg")
    }

})

exports.avatarUpload = multer({
    storage: avatarStorage,

    fileFilter: (req, file, cb) => {
        console.log("caindo aqui")
        // console.log(req.profile._id)
        // console.log(file)
        if (!file.mimetype === "image/gif"
            || !file.mimetype === "image/png"
            || !file.mimetype === "image/jpeg"
            || !file.mimetype === "image/jpg") {
            return cb("Please, upload a image!", false)

        } else {
            cb(null, true)
        }
        // User.findOneAndUpdate(req.profile._id,
        //     { $push: { avatar_profile: file.filename } })
    }
})
//está funcionando
exports.uploadAvatar = async (req, res, next) => {
    // console.log(req.profile)
    try {
        // return res.json({ path: req.file })
        // console.log(req.profile)
        // let user = req.profile;
        // user = _.extend(user, req.file.path)


        if (!req.file.mimetype === "image/gif"
            || !req.file.mimetype === "image/png"
            || !req.file.mimetype === "image/jpeg"
            || !req.file.mimetype === "image/jpg") {
            return res.status(400).json({ error: "Needs to be image or gif" })
        }
        // // console.log(req.file)
        // req.profile.avatar_profile.filename = req.file.filename;
        // req.profile.avatar_profile.contentType = req.file.mimetype;
        // req.profile.avatar_profile.path = req.file.path;
        // console.log(req.profile)
        // console.log("aqui2")

        // avatar.save((err,result)=>{
        //     if(err){
        //         res.json(err)
        //     }
        //     return res.status(200).json(result);
        // });

        // Avatar.findOneAndReplace({ refUser: req.profile._id })
        //     .exec((err, result) => {
        //         if (err || !result) {
        //             console.log(err)
        //             console.log(result);
        //             avatar.save((erro, resultado) => {
        //                 if (erro) {
        //                     return res.json(erro)
        //                 }
        //                 console.log("resultado:" +resultado)
        //                 return res.status(200).json(resultado)
        //             })
        //         }
        //         console.log("result" +result)
        //     })



        let existAvatar = await Avatar.exists({ refUser: req.profile._id });
        if (!existAvatar) {
            let userData = req.profile
            let avatarCreate = new Avatar({
                refUser: req.profile._id,
                contentType: req.file.mimeType,
                path: req.file.path,
                filename: req.file.filename
            });
            console.log("fala ai galera")
            await avatarCreate.save((error, result) => {
                if (error) {
                    return res.status(400).json(error);
                }
                userData.avatar_profile = result._id;
                userData.save()

                return res.json(result)

            })

        } else {
            let user = req.profile;
            console.log("foda-se")
            console.log(req.profile)

            await Avatar.findOneAndUpdate({ refUser: user._id },
                { filename: req.file.filename, path: req.file.path, contentType: req.file.mimetype },
                { $new: true })
                .exec((err, result) => {
                    if (err) {
                        return res.status(400).json({ err })
                    }
                    user.avatar_profile = result._id;
                    user.save();
                    return res.status(200).json(result);

                })
        }

    } catch (e) {
        console.log("aqui")
        return res.status(400).json({ error: "Error while upload image: " + e.toString() })
    }


}

// exports.updateUser = (req, res, next) => {
//     let form = new formidable.IncomingForm(/* { uploadDir: __dirname + "./../uploads/user/avatar" } */)
//     form.keepExtensions = true;
//     form.uploadDir = path.join(__dirname, "./../uploads/user/avatar")
//     form.parse(req, (err, fields, files) => {

//         if (err) {
//             return res.status(400).json({ error: err })
//         }

//         if (!files.img.type === "image/gif"
//             || !files.img.type === "image.png"
//             || !files.img.type === "image/jpeg"
//             || !files.img.type === "image/jpg"
//             || !files.img.type === "image/png") {
//             return res.status(400).json({ error: "Avatar nedds to be a gif, png, jpeg,jpg, or PNG" })
//         }
//         let user = req.profile;
//         user = _.extend(user, fields)

//         if (files.img) {
//             console.log(form.uploadDir)
//             user.avatar_profile = files.img.path

//         }
//         user.save((err, result) => {
//             if (err) {
//                 return res.status(400).json({ error: err })
//             }

//             user.hashed_password = undefined;
//             user.salt = undefined;
//             return res.status(200).json(user)
//         })
//     })
// }
// exports.getAvatarProfile = (req, res, next) => {
//     if (req.profile.avatar_profile) {
//         returnfs.readFileSync(req.profile.avatar_profile)
//         // return res.send(req.profile.avatar_profile)

//     }
// }
exports.getAvatar = (req, res, next) => {
    console.log(req.profile.avatar_profile)
    if (req.profile.avatar_profile) {
        return res.json(`http://localhost:3000/api/${req.profile.avatar_profile.path}`);

        // res.sendFile(req.profile.avatar_profile.path)
    }
    next()
}

exports.updateUser = (req, res) => {
    User.findByIdAndUpdate(req.body.yourId, {
        $set: req.body
    }).exec((err, data) => {
        if (err || !data) {
            return res.status(400).json({ err: "Can't updateData" })
        } else {
            return res.status(200).json("User updated successfully")
        }
    })
}
exports.likeUser = async (req, res) => {
    // console.log("profile: " + req.profile);
    // console.log("target: " + req.userTarget)
    let you = req.profile;
    let targetUser = req.userTarget;


    var likeExists = you.likesSent.map(element => element._id).includes(targetUser._id)
    console.log(likeExists)
    var targetLikeYouExists = you.likesReceived.map(element => element._id).includes(targetUser._id);
    console.log(targetLikeYouExists)

    if (likeExists) {

        if (likeExists && targetLikeYouExists) {
            return res.status(400).json({ error: "We have a match" })
        } else {
            return res.status(400).json({ error: "User already liked!" })
        }
    } else {
        await User.findByIdAndUpdate(targetUser._id,
            {
                $push: { likesReceived: you._id },
            },
            {
                $new: true
            }
        ).populate("likesReceived", "_id username avatar_profile")
            .populate("likesSent", "_id username avatar_profile")
            .exec((err, result) => {
                if (err) {
                    return res.status(400).json({ error: err },)
                } else {

                    result.hashed_password = undefined;
                    result.salt = undefined;
                    return res.status(200).json(result);
                }

            })
        you.likesSent.push(targetUser._id);
        you.save();
    }


}


//metodo para fazer o unlike
exports.unlike = (req, res) => {
    //procurando o post pelo id para poder dar unlikelike, passando o  postagem(corpo da postagem) que recebeu like, e vamos dar um pull no usuraio quando ele descurtir a foto
    //o new true vai permitr buscar a quantidade de likes
    User.findByIdAndUpdate(req.body.userId,
        { $pull: { likes: req.body.yourId } },
        { $new: true }
    ).exec((err, result) => {
        //controlando o erro
        if (err) {
            return res.status(400).json({
                error: err
            })
        } else {
            res.json(result);
        }
    })

}

exports.hasAuthorization = (req, res, next) => {
    //verificando se o usuário logado é o mesmo de quem está vendo o perfil ou é admin/mod
    let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
    let adminUser = req.profile && req.auth && req.auth.role === "admin";

    const isAuthorized = sameUser || adminUser;
    console.log("SameUser", sameUser)
    console.log("adminUser", adminUser)
    console.log(req.profile)
    console.log(req.auth);
    if (!isAuthorized) {
        return res.status(403).json({ error: "User not authorized" })
    }
    next()
}

exports.deleteUser = (req, res, next) => {

    let user = req.profile;
    user.remove((err, result) => {
        if (err || !result) {
            return res.status(400).json({ error: err });
        } else {
            return res.status(200).json({ message: "User deleted successfully" })
        }


    })
}

exports.getUserByDifferentGender = (req, res) => {
    User.find({ gender: { $ne: req.body.gender } }).exec((err, users) => {
        if (err || !users) {
            return res.status(400).json({ error: err })
        } else {
            users.forEach(element => {
                element.hashed_password = undefined;
                element.salt = undefined;
            })
            return res.status(200).json(users);
        }

    })

}

exports.getAllUsers = (req, res) => {
    User.find()
        .populate("avatar_profile", "_id path filename contentType")
        .select('-matches -likesSent -likesReceived')
        .exec((err, users) => {
            if (err) {
                return res.status(400).json(err);
            } else {
                users.forEach(element => {
                    element.hashed_password = undefined;
                    element.salt = undefined;
                });
                return res.status(200).json(users);
            }
        })
}
exports.getLikes = async (req, res) => {

    await User.find(
        { likesReceived: req.body.yourId },
    )
        .exec((err, users) => {
            if (err) {
                return res.status(400).json(err);
            }
            else {
                users.forEach(element => {
                    element.hashed_password = undefined;
                    element.salt = undefined;
                })
                return res.status(200).json(users);
            }
        })
}




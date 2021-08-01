const User = require("../models/user")
const multer = require("multer")
const uuid = require("uuidv1")
const formidable = require("formidable")
const fs = require("fs")
const _ = require("lodash")
const path = require("path")
const Avatar = require("../models/avatar")
const user = require("../models/user")

exports.userById = (req, res, next, id) => {
    User.findById(id)
        .populate("likesSent", "_id username avatar_profile photos")
        .populate("likesReceived", "_id username avatar_profile")
        .exec((err, user) => {
            if (err) {
                return res.satus(400).json({ error: "User not found" })
            }
            //criando o objeto profile com as infos do usuario
            req.profile = user;
            next()
        });
}
exports.targetUserById = (req, res, next, id) => {
    User.findById(id)
        .populate("likesSent", "_id username avatar_profile photos")
        .populate("likesReceived", "_id username avatar_profile")
        .exec((err, user) => {
            if (err) {
                return res.status(400).json({ error: "User not found" })
            }
            //criando o objeto profile com as infos do usuario
            req.profile = user;
            next()
        });
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
            avatarCreate.save((error, result) => {
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
        // return res.json("http://localhost:3000/api/" + req.profile.avatar_profile);

        res.sendFile(__dirname + req.profile.avatar_profile)
    }
}

exports.likeUser = (req, res) => {
    console.log(req.body.targetUserId);
    User.findByIdAndUpdate(req.body.targetUserId,
        {
            $push: { likesSent: req.body.userId },
        },
        {
            $new: true
        }
    ).exec((err, result) => {
        if (err) {
            return res.status(400).json({ error: err },)
        } else {
            return res.status(200).json(result);
        }
    })
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





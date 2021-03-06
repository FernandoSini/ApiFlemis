const User = require("../models/user")
const multer = require("multer")
const uuid = require("uuidv1")
const formidable = require("formidable")
const fs = require("fs")
const _ = require("lodash")
const path = require("path")
const Avatar = require("../models/avatar")
const Match = require("../models/match")
const UserPhoto = require("../models/userPhotos");
const Event = require("../models/event")
const EventPhoto = require("../models/eventPhotos")
const Message = require("../models/message")
var AWS = require("aws-sdk")
var creds = new AWS.Credentials({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY, sessionToken: null })
AWS.config.update({ credentials: creds, region: process.env.AWS_REGION })
// teste
exports.userById = (req, res, next, id) => {
    User.findById(id)
        .populate("likesSent", "_id username avatar_profile")
        .populate("likesReceived", "_id username avatar_profile")
        .populate("avatar_profile", "path filename contentType")
        .populate("photos", "path filename contentType")
        .exec((err, user) => {
            if (err) {
                return res.status(400).json({ error: "User not found" })
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
            next()
        });
}
exports.getUserProfile = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;

    return res.status(200).json(req.profile)
}

const avatarStorage = multer.diskStorage({
    destination: "./uploads/user/avatar",
    filename: (req, file, cb) => {

        cb(null, req.profile._id + Date.now() + path.extname(file.originalname));
        //se n??o der certo vamos usar
        //cb(null, Date.now()+".jpg")
    }

})

exports.avatarUpload = multer({
    storage: avatarStorage,

    fileFilter: (req, file, cb) => {

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
//est?? funcionando
exports.uploadAvatar = async (req, res, next) => {
    // console.log(req.profile)
    try {


        if (!req.file.mimetype === "image/gif"
            || !req.file.mimetype === "image/png"
            || !req.file.mimetype === "image/jpeg"
            || !req.file.mimetype === "image/jpg") {
            return res.status(400).json({ error: "Needs to be image or gif" })
        }
        const fileContent = fs.readFileSync(req.file.path)
        var params = {
            acl: 'public-read',
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: req.file.filename,
            Body: fileContent

        }
        var s3 = new AWS.S3({ credentials: creds });
        // console.log(s3)

        let existAvatar = await Avatar.exists({ refUser: req.profile._id });
        if (!existAvatar) {

            s3.upload(params, async (err, data) => {
                if (err) {

                    return res.status(400).json({ err: err });
                }
                let userData = req.profile
                let avatarCreate = new Avatar({
                    refUser: req.profile._id,
                    contentType: req.file.mimetype,
                    // path: req.file.path,
                    path: data.Location,
                    filename: req.file.filename
                });

                await avatarCreate.save((error, result) => {
                    if (error) {
                        return res.status(400).json({ err: error });
                    }

                    userData.avatar_profile = result._id;
                    userData.save()

                    return res.json(result)

                })
            });


        } else {
            let user = req.profile;


            // var fileUpdatedUrl = s3.upload(params, (err, data) => {
            //     if (err) {
            //         console.log("1" + err)
            //         throw err
            //     }
            //     return data.location;
            // });
            s3.upload(params, async function (err, data) {
                if (err) {
                    throw err;
                }
                console.log(data)
                console.log(`File updated successfully. ${data.Location}`);

                await Avatar.findOneAndUpdate({ refUser: user._id },
                    {
                        filename: req.file.filename, /* path: req.file.path */
                        path: data.Location, contentType: req.file.mimetype
                    },
                    { new: true })
                    .exec((err, result) => {
                        if (err || !result) {
                            return res.status(400).json({ err: err })
                        }
                        user.avatar_profile._id = result._id;
                        user.avatar_profile.path = result.path;
                        user.avatar_profile.contentType = result.contentType;
                        user.avatar_profile.filename = result.filename;
                        user.save();

                        return res.status(200).json(result);

                    })
            });


        }

    } catch (e) {

        return res.status(400).json({ error: "Error while upload image: " + e.toString() })
    }


}
// exports.updateAvatar = async (req, res, next) => {
//     // console.log(req.profile)

//     let form = new formidable.IncomingForm({ uploadDir: "./uploads/user/avatar" })
//     form.keepExtensions = true;
//     form.parse(req, async (err, fields, file) => {

//         if (err) {
//             console.log(err)
//             return res.status(400).json({ error: err })
//         }

//         if (file.img) {
//             if (!file.img.type === "image/gif"
//                 || !file.img.type === "image/png"
//                 || !file.img.type === "image/jpeg"
//                 || !file.img.type === "image/jpg") {
//                 return res.status(400).json({ error: "Needs to be image or gif" })
//             }



//             let existAvatar = await Avatar.exists({ refUser: req.profile._id });
//             if (!existAvatar) {
//                 let userData = req.profile
//                 let avatarCreate = new Avatar({
//                     refUser: req.profile._id,
//                     contentType: file.img.type,
//                     path: file.img.path,
//                     filename: file.img.name
//                 });
//                 console.log("fala ai galera")
//                 await avatarCreate.save((error, result) => {
//                     if (error) {
//                         return res.status(400).json(error);
//                     }
//                     userData.avatar_profile = result._id;
//                     userData.save()

//                     return res.json(result)

//                 })

//             } else {
//                 let user = req.profile;
//                 console.log("foda-se")
//                 // console.log(req.profile)

//                 await Avatar.findOneAndUpdate({ refUser: user._id },
//                     { filename: file.img.name, path: file.img.path, contentType: file.img.type },
//                     { new: true })
//                     .exec((err, result) => {
//                         if (err) {
//                             return res.status(400).json({ err })
//                         }
//                         user.avatar_profile._id = result._id;
//                         user.avatar_profile.path = result.path;
//                         user.avatar_profile.contentType = result.contentType;
//                         user.avatar_profile.filename = result.filename;
//                         user.save();

//                         return res.status(200).json(result);

//                     })
//             }
//         }
//     })



// }

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

    if (req.profile.avatar_profile) {
        return res.json(`http://localhost:3000/api/${req.profile.avatar_profile.path}`);

        // res.sendFile(req.profile.avatar_profile.path)
    }
    next()
}

exports.updateUser = async (req, res) => {

    await User.findByIdAndUpdate({ _id: req.profile._id }, {
        $set: req.body
    }, { new: true })
        .populate("avatar_profile", "_id path filename contentType")
        .populate("photos", "_id path filename contentType")
        .populate({
            path: "likesReceived", populate: {
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            },
            select:
                "-salt -hashed_password -email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -photos -usertype -role -birthday -createdAt -about -livesIn -job -company -school -__v"

        })
        .populate({
            path: "likesSent", populate: {
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            },
            select:
                "-salt -hashed_password -email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -photos -usertype -role -birthday -createdAt -about -livesIn -job -company -school -__v"

        }).select("-matches")
        .exec((err, data) => {
            if (err || !data) {

                return res.status(400).json({ err: "Can't updateData" })
            } else {


                return res.status(200).json(data);
                // return res.status(200).json("User updated successfully")
            }
        })
}
exports.likeUser = async (req, res) => {

    let you = req.profile;
    let targetUser = req.userTarget;


    var likeExists = you.likesSent.map(element => element._id).includes(targetUser._id)

    var targetLikeYouExists = you.likesReceived.map(element => element._id).includes(targetUser._id);


    if (likeExists) {

        return res.status(400).json({ error: "User already liked!" })

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
                    if (targetLikeYouExists) {
                        let match = new Match({ user1: targetUser._id, user2: you._id });
                        match.save((err, result) => {
                            if (err) {
                                return res.status(400).json({ error: err })
                            }
                            you.matches.push(result._id);
                            you.save()
                            targetUser.matches.push(result._id);
                            targetUser.save()




                        })
                    }
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
    //verificando se o usu??rio logado ?? o mesmo de quem est?? vendo o perfil ou ?? admin/mod
    let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
    let adminUser = req.profile && req.auth && req.auth.role === "admin";

    const isAuthorized = sameUser || adminUser;

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
    // console.log(req.query.yourId)
    // User.find({ gender: { $ne: req.query.gender }, $and: { likesReceived: { $ne: req.query.yourId } } })
    User.find({ $and: [{ gender: { $ne: req.query.gender } }, { likesReceived: { $ne: req.query.yourId } }] })
        .populate("likesSent", "_id firstname lastname username birthday")
        .populate("likesReceived", "_id firstname lastname username birthday")
        .populate("avatar_profile", "_id path contentType filename")
        .populate("photos", "_id path contentType filename")
        .select("-matches -eventsGoing -eventsCreated")
        .exec((err, users) => {
            if (err || !users) {
                if (!users || !users.length) {
                    return res.status(404).json({ error: "Not Found!" })
                }
                return res.status(400).json({ error: err })
            }
            users.forEach(element => {
                element.hashed_password = undefined;
                element.salt = undefined;
            })
            return res.status(200).json(users);


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

exports.getLikesReceived = async (req, res) => {

    await User.find({ likesSent: req.profile._id })
        .populate("avatar_profile", "_id path contentType filename")
        .populate("photos", "_id path contentType filename")
        .select("-likesSent -likesReceived -gender -matches -eventsGoing -eventsCreated -email -createdAt -__v ")
        .exec((err, usersLiked) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            if (!usersLiked.length) {
                return res.status(404).json({ error: "Not found users who like you" })
            }
            usersLiked.forEach(element => {
                element.hashed_password = undefined;
                element.salt = undefined;
            })
            return res.status(200).json(usersLiked)
        })
}

exports.uploadPhotos = async (req, res) => {
    let form = new formidable.IncomingForm({ uploadDir: "./uploads/user/photos" })
    form.keepExtensions = true;
    // form.uploadDir = path.join(__dirname, "./../uploads/events/photo")

    form.parse(req, async (err, fields, files) => {


        if (err) {

            return res.status(400).json({ error: err })
        }


        if (files.img) {
            if (!files.img.type === "image/gif"
                || !files.img.type === "image.png"
                || !files.img.type === "image/jpeg"
                || !files.img.type === "image/jpg"
                || !files.img.type === "image/png") {
                return res.status(400).json({ error: "Avatar nedds to be a gif, png, jpeg,jpg, or PNG" })
            }


            const fileContent = fs.readFileSync(files.img.path);
            var params = {
                acl: 'public-read',
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: files.img.name,
                Body: fileContent

            }
            var s3 = new AWS.S3({ credentials: creds });
            s3.upload(params, (err, data) => {
                if (err) {
                    throw err
                }
                let userPhoto = new UserPhoto({
                    refUser: req.profile._id,
                    contentType: files.img.type,
                    path: data.Location,
                    filename: files.img.name
                });
                userPhoto.save((err, result) => {
                    let user = req.profile;
                    user.photos.push({ _id: result._id })
                    user.save();

                    return res.status(200).json(result);
                });
            })


        }

    })

}
exports.deleteAvatar = async (req, res) => {
    let avatar_profile = req.profile.avatar_profile;
    //esses dois m??todos funcionam para deletar um usuario
    // req.profile.avatar_profile.remove();
    // req.profile.avatar_profile = undefined;
    // req.profile.save();
    // console.log("caindo aqui" + avatar_profile._id);
    if (avatar_profile) {
        var params = {
            // acl: 'public-read',
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: avatar_profile.filename,
            // Body: fileContent

        }
        var s3 = new AWS.S3({ credentials: creds });
        await s3.deleteObject(params, (err, data) => {
            if (err) {
                return res.status(400).json({ err: err })
            }
            console.log(data + "deleted successfully");
        }).promise()
        await User.findOneAndUpdate({ _id: req.profile._id },
            { $unset: { avatar_profile: avatar_profile._id } },
            { new: true })
            .exec((err, userData) => {
                if (err) {
                    return res.status(400).json({ err: err });
                }

                Avatar.findOneAndDelete({ _id: req.profile.avatar_profile._id },
                )
                    .exec((err, result) => {
                        if (err) {
                            return res.status(400).json({ err: "Can't remove avatar" + err })
                        }
                        return res.status(200).json({ message: "removed" });
                    })
            });
    } else {
        return res.status(400).json({ err: "Can't delete avatar that is null" });
    }


}

exports.deleteUser = async (req, res) => {
    await User.updateMany(
        {
            $or: [{ likesSent: req.body.yourId }, { likesReceived: req.body.yourId }]
        },
        {
            $pull: [{ likesSent: req.body.yourId }, { likesReceived: req.body.yourId }]
        },
        {
            new: true
        }
    );
    await Match.deleteMany({ $or: [{ user1: req.body.yourId }, { user2: req.body.yourId }] });
    await Message.deleteMany({ $or: [{ from: req.body.yourId }, { target: req.body.yourId }] });
    await Event.deleteMany({ event_owner: req.body.yourId });
    await Avatar.deleteOne({ refUser: req.body.yourId });
    await User.findByIdAndDelete({ _id: req.body.yourId }).exec((err, result) => {
        if (err) {
            return res.status(400).json({ error: err })
        }

        return res.status(200).json("User deleted successfully");
    })

}

exports.deleteUserPhoto = async (req, res) => {
    // console.log(req.profile);
    // console.log("photoId:" + req.body.photoId);
    // console.log(req.profile.photos.map((element) => element.id).includes(req.body.photoId))


    var params = {
        // acl: 'public-read',
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.body.photoName,
        // Body: fileContent

    }
    var s3 = new AWS.S3({ credentials: creds });
    await s3.deleteObject(params, (err, data) => {
        if (err) {
            return res.status(400).json({ err: err })
        }
        console.log(data + "deleted successfully");
    }).promise()
    req.profile.photos.pull({ _id: req.body.photoId });
    req.profile.save();
    // req.profile.photos.pull({_id:req.photo});

    await UserPhoto.findOneAndDelete({ _id: req.body.photoId })
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({ err: err })
            }

            return res.status(200).json({ "message": "deleted successfully" });
        });


    // var params = {
    //     acl: 'public-read',
    //     Bucket: process.env.AWS_BUCKET_NAME,
    //     Key: req.filetoDelete,
    //     // Body: fileContent

    // }
    // var s3 = new AWS.S3({ credentials: creds });
    // s3.deleteObject(params, (err, data)=> {
    //     if(err){
    //         return res.status(400).json({err:err})
    //     }
    //     console.log(data+ "deleted successfully");
    // })
    // await User.findOneAndUpdate() //parei aqui
    // await UserPhoto.findOneAndDelete({filename:req.filetoDelete}).exec((err,result)=> {
    //     if(err){
    //         return res.status(400).json({err:err})
    //     }
    //     if(!result) {
    //         return res.status(404).json({err: "Can't delete because this photo doesn't exists"});
    //     }

    //     return res.status(200).json({message:"Deleted successfully"})
    // })


}



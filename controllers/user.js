const User = require("../models/user")
const multer = require("multer")
const uuid = require("uuidv1")

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
    destination: "/uploads/user/avatar",
    filename: (req, file, cb) => {
        cb(null, uuid() + file.path.extname(file.originalname));
        //se não der certo vamos usar
        //cb(null, Date.now()+".jpg")
    }
})

exports.avatarUpload = multer({
    storage: avatarStorage, fileFilter: (req, file, cb) => {

        if (!file.mimetype.match("image/gif")
            || !file.mimetype.match("image/png")
            || !file.mimetype.match("image/jpeg")
            || !file.mimetype.match("image/jpg")) {
            return cb("Please, upload a image!", false)
        }
        cb(null, true)
        User.findOneAndUpdate(req.profile._id,
            { $push: { avatar_profile: file.filename } })
    }
})

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





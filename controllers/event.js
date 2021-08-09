const User = require("../models/user")
const Event = require("../models/event");
const EventPhoto = require("../models/eventPhotos")
const multer = require("multer")

exports.getEventById = (req, res, next, id) => {
    Event.findById(id)
        .populate("event_owner", "username firstname lastname")
        .populate("users" ,"username firstname lastname")
        .populate("event_photo" ,"path contentType filename")
        .exec((err, event) => {
            if (err) {
                return res.status(400).json({ err: err })
            }
            if (!event) {
                return res.status(400).json("Event not found")
            }
            req.event = event;
            let now = new Date()
            if (now >= req.event.end_date) {
                console.log("caiu aqui")
                req.event.event_status = "ENDED"
                event.save()
            } else if (now < event.start_date) {
                console.log("caí no 2")
                req.event.event_status = "INCOMING"
                req.event.save();
            } else {
                req.event.event_status = "HAPPENING";
                req.event.save();
            }
            next()
        })
}

exports.createEvent = async (req, res) => {
    console.log(req.body)
    let event = await new Event(req.body);
    event.save();
    return res.status(200).json("Event created successfully")

}
exports.getSingleEvent = async (req, res) => {
    await Event.findById(req.eventId._id)
        .populate("event_owner"," firstname lastname username")
        .exec((err, event) => {
            if (err) {
                return res.status(400).json(err)
            } else {

                let now = new Date()
                if (now >= event.end_date) {
                    console.log("caiu aqui")
                    event.event_status = "ENDED"
                    event.save()
                } else if (now < event.start_date) {
                    console.log("caí no 2")
                    event.event_status = "INCOMING"
                    event.save();
                } else {
                    event.event_status = "HAPPENING";
                    event.save();
                }

                // console.log(events)
                return res.status(200).json(events);
            }
        })
}

exports.getEvents = async (req, res) => {
    await Event.find()
        .populate("event_owner", "username firstname lastname")
        .exec((err, eventList) => {
            if (err) {
                return res.status(400).json(err)
            } else {
                let events = eventList;
                if (!eventList.users == undefined || !eventList.users == null) {
                    eventList.users.forEach(element => {
                        element.hashed_password = undefined;
                        element.salt = undefined;
                    })
                }
                eventList.forEach(event => {
                    event.event_owner.hashed_password = undefined;
                    event.event_owner.salt = undefined;
                    console.log(event.end_date)
                    let now = new Date()
                    if (now >= event.end_date) {
                        console.log("caiu aqui")
                        event.event_status = "ENDED"
                        event.save()
                    } else if (now < event.start_date) {
                        console.log("caí no 2")
                        event.event_status = "INCOMING"
                        event.save();
                    } else {
                        event.event_status = "HAPPENING";
                        event.save();
                    }
                })
                // console.log(events)
                return res.status(200).json(events);
            }
        })
}

exports.isEventOwner = (req, res, next) => {
    
    let sameUser = req.event && req.auth && req.event.event_owner._id == req.auth._id
    let adminUser = req.event && req.auth && req.auth.role === "admin";
    let authorized = sameUser || adminUser;

    if (!authorized) {
        return res.status(403).json({ error: "User not authorized to make this action" })
    }
    next()
}


exports.updateEvent = (req, res) => {

    Event.findByIdAndUpdate(req.body.eventId,
        {
            $set: req.body
        }
    ).exec((err, updatedEvent) => {
        if (err) {
            return res.status(400).json(err)
        } else {

            return res.status(200).json(updatedEvent);
        }

    })
}

const eventStorage = multer.diskStorage({
    destination: "./uploads/events/photo",
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname));
        //se não der certo vamos usar
        //cb(null, Date.now()+".jpg")
    }

})

exports.eventPhotoUpload = multer({
    storage: eventStorage,

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
exports.uploadEventCover = async (req, res, next) => {
    // console.log(req.profile)
    try {

        if (!req.file.mimetype === "image/gif"
            || !req.file.mimetype === "image/png"
            || !req.file.mimetype === "image/jpeg"
            || !req.file.mimetype === "image/jpg") {
            return res.status(400).json({ error: "Needs to be image or gif" })
        }

        let existEventPhoto = await EventPhoto.exists({ ref: req.event._id });
        if (!existEventPhoto) {
            let userData = req.profile
            let createEvent = new EventPhoto({
                refEvent: req.event._id,
                refUser: req.profile._id,
                contentType: req.file.mimeType,
                path: req.file.path,
                filename: req.file.filename
            });
            console.log("fala ai galera")
            createEvent.save((error, result) => {
                if (error) {
                    return res.status(400).json(error);
                }
                return res.json(result)

            })

        } else {
            await EventPhoto.findOneAndUpdate({ refEvent: req.event._id },
                { filename: req.file.filename, path: req.file.path, contentType: req.file.mimetype },
                { $new: true })
                .exec((err, result) => {
                    if (err) {
                        return res.status(400).json({ err })
                    }
                    return res.status(200).json(result);
                })
        }

    } catch (e) {
        console.log("aqui")
        return res.status(400).json({ error: "Error while upload image: " + e.toString() })
    }


}
const User = require("../models/user")
const Event = require("../models/event");
const EventPhoto = require("../models/eventPhotos")
const multer = require("multer")
const uuid = require("uuidv1")
const path = require("path")
const formidable = require("formidable")
const _ = require("lodash");


exports.getEventById = (req, res, next, id) => {
    Event.findById(id)
        .populate("event_owner", "username firstname lastname")
        .populate("users", "username firstname lastname")
        .populate("event_photo", "path contentType filename")
        .exec((err, event) => {
            if (err) {
                return res.status(400).json({ err: err })
            }
            if (!event) {
                return res.status(400).json("Event not found")
            }
            req.event = event;
            let now = new Date(Date.now());
            let endDate = new Date(new Date(event.end_date.toString()));
            let startDate = new Date(new Date(event.start_date.toString()));
            // if (now >= endDate || event.event_status =="ENDED") {

            //     req.event.event_status = "ENDED"

            // } else if (now <= startDate) {

            //     req.event.event_status = "INCOMING"

            // } else {
            //     req.event.event_status = "HAPPENING";

            // }
            // if (now >= endDate && now > startDate) {
            //     req.event.event_status = "ENDED";
            //     req.event.save();
            // } else if (now < startDate && now < endDate) {
            //     req.event.event_status = "INCOMING"
            //     req.event.save()
            // } else {
            //     req.event.event_status = "HAPPENING"
            //     req.event.save();
            // }
            if (now < startDate) {
                req.event.event_status = "INCOMING";
                req.event.save();
            } else if (now >= startDate && endDate <= now) {
                req.event.event_status = "HAPPENING"
                req.event.save()
            } else {
                req.event.event_status = "ENDED"
                req.event.save();
            }
            next()
        })
}

exports.createEvent = async (req, res) => {

    let event = await new Event(req.body);
    event.save();
    User.findByIdAndUpdate(req.body.event_owner, { $push: { eventsCreated: event._id } }).exec((err, result) => {
        if (err || !result) {
            return res.status(400).json({ error: err })
        }

    });
    return res.status(200).json("Event created successfully")

}
exports.getSingleEvent = async (req, res) => {
    await Event.findById(req.event._id)
        .populate("event_owner", " firstname lastname username")
        .exec((err, event) => {
            if (err) {
                return res.status(400).json(err)
            } else {

                let now = new Date(Date.now());
                let endDate = new Date(new Date(event.end_date.toString()));
                let startDate = new Date(new Date(event.start_date.toString()));
                // if (now >= endDate || event.event_status == "ENDED") {

                //     event.event_status = "ENDED"
                //     event.save()
                // } else if (now <= startDate) {

                //     event.event_status = "INCOMING"
                //     event.save();
                // } else {
                //     event.event_status = "HAPPENING";
                //     event.save();
                // }
                // if (now >= endDate && now > startDate) {
                //     event.event_status = "ENDED";
                //     event.save();
                // } else if (now < startDate && now < endDate) {
                //     event.event_status = "INCOMING"
                //     event.save()
                // } else {
                //     event.event_status = "HAPPENING"
                //     event.save()
                // }
                if (now < startDate) {
                    event.event_status = "INCOMING";
                    event.save();
                } else if (now >= startDate && endDate <= now) {
                    event.event_status = "HAPPENING"
                    event.save()
                } else {
                    event.event_status = "ENDED"
                    event.save();
                }


                return res.status(200).json(event);
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

                    let now = new Date(Date.now());
                    let endDate = new Date(new Date(event.end_date.toString()));
                    let startDate = new Date(new Date(event.start_date.toString()));

                    // if (now >= endDate || event.event_status == "ENDED") {

                    //     event.event_status = "ENDED"
                    //     event.save()
                    // } else if (now <= startDate) {

                    //     event.event_status = "INCOMING"
                    //     event.save();
                    // } else {
                    //     event.event_status = "HAPPENING";
                    //     event.save();
                    // }

                    if (startDate > now) {
                        event.event_status = "INCOMING";
                        event.save();
                    } else if (endDate <= now) {
                        event.event_status = "ENDED"
                        event.save()
                    } else {
                        event.event_status = "HAPPENING"
                        event.save();
                    }
                })

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


exports.updateEvent = async (req, res) => {
    // Event.findByIdAndUpdate(req.body.eventId,
    //     {
    //         $set: req.body
    //     }
    // ).exec((err, updatedEvent) => {
    //     if (err) {
    //         return res.status(400).json(err)
    //     } else {

    //         return res.status(200).json(updatedEvent);
    //     }

    // })

    let form = new formidable.IncomingForm({ uploadDir: "./uploads/events/photo" })
    form.keepExtensions = true;
    // form.uploadDir = path.join(__dirname, "./../uploads/events/photo")
    form.parse(req, async (err, fields, files) => {


        if (err) {

            return res.status(400).json({ err: err })
        }


        if (files.img) {
            if (!files.img.type === "image/gif"
                || !files.img.type === "image.png"
                || !files.img.type === "image/jpeg"
                || !files.img.type === "image/jpg"
                || !files.img.type === "image/png") {
                return res.status(400).json({ err: "Avatar needs to be a gif, png, jpeg,jpg, or PNG" })
            }


            let eventCoverExists = await EventPhoto.exists({ refEvent: req.event._id })

            if (!eventCoverExists) {

                let eventphoto = new EventPhoto({
                    refEvent: req.event._id,
                    contentType: files.img.type,
                    path: files.img.path,
                    filename: files.img.name
                });
                eventphoto.save();
                req.event.event_cover = eventphoto._id
            } else {

                let eventPhoto = await EventPhoto.findOneAndUpdate({ refEvent: req.event._id },
                    { filename: files.img.name, path: files.img.path, contentType: files.img.type },
                    { $new: true })
                    .exec((err, result) => {
                        if (err) {
                            return res.status(400).json({ err: err })
                        }
                        req.event.event_cover = result._id;
                        // return res.status(200).json(result);
                    });


            }

        }


        let event = req.event;
        event = _.extend(event, fields)

        event.save((err, result) => {
            if (err) {

                return res.status(400).json({ err: "erro ao tentar atualizar o evento" })
            }


            return res.status(200).json(event)
        })
    })


}

const eventStorage = multer.diskStorage({
    destination: "./uploads/events/photo",
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname));
        //se não der certo vamos usar
        //cb(null, new Date()+".jpg")
    }

})

exports.eventPhotoUpload = multer({
    storage: eventStorage,

    fileFilter: (req, file, cb) => {

        if (!file.mimetype === "image/gif"
            || !file.mimetype === "image/png"
            || !file.mimetype === "image/jpeg"
            || !file.mimetype === "image/jpg") {
            return cb("Please, upload a image!", false)

        } else {
            cb(null, true)
        }

    }
})

//está funcionando
exports.uploadEventCover = async (req, res, next) => {
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
        return res.status(400).json({ error: "Error while upload image: " + e.toString() })
    }


}
exports.getEventsByEventStatus = async (req, res) => {
    await Event.find({ event_status: req.query.eventstatus })
        .populate({
            path: "event_owner", populate: {
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            },
            select:
                "-email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -photos -usertype -role -birthday -createdAt -about -livesIn -job -company -school -__v"

        })
        .populate("event_owner.avatar_profile", "_id path filename ")
        // .populate("users", "_id username firstname lastname avatar_profile")
        .populate({
            path: "users", populate: [{
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            }, { path: "photos", model: "UserPhoto", select: "-refUser -__v" }],
            select:
                "-email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -usertype -role  -createdAt  -__v"

        })
        .populate("event_cover", "_id path contentType filename")
        .exec((err, events) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            if (!events.length) {
                return res.status(404).json({ error: "Not found events with this status" })
            }
            if (!events.users == undefined || !events.users == null) {
                events.users.forEach(element => {
                    element.hashed_password = undefined;
                    element.salt = undefined;
                })
            }
            events.forEach(event => {
                event.event_owner.hashed_password = undefined;
                event.event_owner.salt = undefined;
                let now = new Date(Date.now());
                let endDate = new Date(new Date(event.end_date.toString()));
                let startDate = new Date(new Date(event.start_date.toString()));
                //     if (now >= endDate || event.event_status == "ENDED") {
                //         event.event_status = "ENDED"
                //         event.save()
                //     } else if (now <= startDate) {
                //         event.event_status = "INCOMING"
                //         event.save();
                //     } else {
                //         event.event_status = "HAPPENING";
                //         event.save();
                //     }
                // })
                if (startDate > now) {
                    event.event_status = "INCOMING";
                    event.save();
                } else if (endDate <= now) {
                    event.event_status = "ENDED"
                    event.save()
                } else {
                    event.event_status = "HAPPENING"
                    event.save();
                }
            })

            return res.status(200).json(events);

        })
}


exports.searchEventsByName = async (req, res) => {
    await Event.find({ event_name: req.query.eventname })
        .populate({
            path: "event_owner", populate: {
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            },
            select:
                "-email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -photos -usertype -role -birthday -createdAt -about -livesIn -job -company -school -__v"

        })
        .populate("event_cover", "_id path filename contentType")
        .populate("event_owner.avatar_profile", "_id path filename ")
        // .populate("users", "_id username firstname lastname")
        .populate({
            path: "users", populate: [{
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            }, { path: "photos", model: "UserPhoto", select: "-refUser -__v" }],
            select:
                "-email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -usertype -role -createdAt  -__v"

        })
        .populate("event_photo", "_id path contentType filename")
        .exec((err, events) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            if (!events.length) {
                return res.status(404).json({ error: "Not found events with this name" })
            }
            if (!events.users == undefined || !events.users == null) {
                events.users.forEach(element => {
                    element.hashed_password = undefined;
                    element.salt = undefined;
                })
            }
            events.forEach(event => {
                event.event_owner.hashed_password = undefined;
                event.event_owner.salt = undefined;
                let now = new Date(Date.now());
                let endDate = new Date(new Date(event.end_date.toString()));
                let startDate = new Date(new Date(event.start_date.toString()));
                // if (endDate >= now || event.event_status == "ENDED") {
                //     event.event_status = "ENDED"
                //     event.save()
                // } else if (now <= startDate) {
                //     event.event_status = "INCOMING"
                //     event.save();
                // } else {
                //     event.event_status = "HAPPENING";
                //     event.save();
                // }

                if (startDate > now) {
                    event.event_status = "INCOMING";
                    event.save();
                } else if (endDate <= now) {
                    event.event_status = "ENDED"
                    event.save()
                } else {
                    event.event_status = "HAPPENING"
                    event.save();
                }
            })

            return res.status(200).json(events);

        })
}
exports.getGoingEvents = async (req, res) => {
    await Event.find({ users: { $in: [req.query.userId] } })
        // .populate("users", "_id username firstname lastname avatar_profile")
        // .populate("avatar_profile", "_id path contentType filename")
        .populate({
            path: "event_owner", populate: {
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            },
            select:
                "-email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -photos -usertype -role -birthday -createdAt -about -livesIn -job -company -school -__v"

        })
        .populate({
            path: "users", populate: [{
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            }, { path: "photos", model: "UserPhoto", select: "-refUser -__v" }],
            select:
                "-email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -usertype -role -createdAt  -__v"

        })
        .exec((err, events) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            if (!events.length) {
                return res.status(404).json({ error: "Not found events you're going" })
            }

            return res.status(200).json(events);
        })
}
exports.getYourEvents = async (req, res) => {
    await Event.find({ event_owner: req.query.yourId })
        .populate({
            path: "event_owner", populate: {
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            },
            select:
                "-email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -photos -usertype -role -birthday -createdAt -about -livesIn -job -company -school -__v"

        })
        .populate("event_cover", "_id path contentType filename")
        .populate("users", "_id username firstname lastname avatar_profile")
        .populate({
            path: "users", populate: [{
                path: "avatar_profile",
                model: "Avatar",
                select: "-refUser -__v"
            }, { path: "photos", model: "UserPhoto", select: "-refUser -__v" }],
            select:
                "-email -likesSent -likesReceived -eventsGoing -eventsCreated -matches -gender -usertype -role -createdAt  -__v"

        })
        .exec((err, events) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            if (!events.length) {
                return res.status(404).json({ error: "Not found events you're going" })
            }

            return res.status(200).json(events);
        })
}
exports.goToEvent = async (req, res) => {

    var userInEventExists = req.event.users.map(element => element._id).includes(req.body.yourId);

    if (userInEventExists) {
        return res.status(400).json({ error: "user going to this event" })
    } else {
        req.event.users.push(req.body.yourId);
        req.event.save();
        await User.findByIdAndUpdate(req.body.yourId, { $push: { eventsGoing: req.event._id } }) //$push adicionando evento que ele vai ao usuario
            .exec((err, result) => {
                if (err || !result) {
                    return res.status(400).json({ error: err })
                }
            });

    }
}
exports.removeUserFromEvent = async (req, res) => {
    console.log(req.body.yourId);
    console.log(req.event);
}
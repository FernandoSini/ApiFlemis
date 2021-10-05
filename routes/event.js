const express = require("express")
const router = express.Router()
const { createEvent, getEventById, getEvents,
    getSingleEvent, updateEvent, isEventOwner,
    getEventsByEventStatus, searchEventsByName,
    getGoingEvents, eventPhotoUpload, uploadEventCover,
    getYourEvents, goToEvent, deleteEvent } = require("../controllers/event")
const { requireLogin } = require("../controllers/auth")

router.get("/api/events/all", requireLogin, getEvents)
router.post("/api/events/create", requireLogin, createEvent)
router.put("/api/event/:eventId/upload/cover", requireLogin, isEventOwner, eventPhotoUpload.single("img"), uploadEventCover)
router.put("/api/event/:eventId/edit", requireLogin, isEventOwner, updateEvent)
router.get("/api/event/:eventId", requireLogin, getSingleEvent)
router.get("/api/event/users/:eventId")
router.get("/api/events/yourEvents?:yourId", requireLogin, getYourEvents)
router.get("/api/events?:eventstatus", requireLogin, getEventsByEventStatus)
router.get("/api/events/find?:eventname", requireLogin, searchEventsByName)
router.get("/api/events/goingEvents?:userId", requireLogin, getGoingEvents)
router.post("/api/events/:eventId/go", requireLogin, goToEvent)
router.put("/api/events/:eventId/removeUser")
router.delete("/api/events/:eventId/delete", requireLogin, isEventOwner, deleteEvent)

router.param("eventId", getEventById)
// router.param("eventStatus", getEventStatus)
module.exports = router

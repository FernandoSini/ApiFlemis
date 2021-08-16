const express = require("express")
const router = express.Router()
const { createEvent, getEventById, getEvents, getSingleEvent, updateEvent, isEventOwner, getEventsByEventStatus, searchEventsByName } = require("../controllers/event")
const { requireLogin } = require("../controllers/auth")

router.get("/api/events/all", getEvents)
router.post("/api/events/create", requireLogin, createEvent)
router.put("/api/event/:eventId/addPhoto", requireLogin)
router.put("/api/event/:eventId/edit", requireLogin, isEventOwner, updateEvent)
router.get("/api/event/:eventId", getSingleEvent)
router.get("/api/event/users/:eventId")
router.get("/api/events?:eventstatus", getEventsByEventStatus)
router.get("/api/events/find?:eventname", searchEventsByName)


router.param("eventId", getEventById)
// router.param("eventStatus", getEventStatus)
module.exports = router

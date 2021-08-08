const express = require("express")
const router = express.Router()
const { createEvent, getEventById, getEvents, getSingleEvent, updateEvent, isEventOwner } = require("../controllers/event")
const { requireLogin } = require("../controllers/auth")

router.get("/api/events/all", getEvents)
router.post("/api/events/create", createEvent)
router.put("/api/event/:eventId/addPhoto")
router.put("/api/event/:eventId/edit", requireLogin, isEventOwner, updateEvent)
router.get("/api/event/:eventId", getSingleEvent)
router.get("/api/event/users/:eventId")


router.param("eventId", getEventById)
module.exports = router

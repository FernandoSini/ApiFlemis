const express = require("express")
const router = express.Router();
const { userById } = require("../controllers/user")
const { getMatchesByUserId } = require("../controllers/match")


//criando as rotas do match

router.get("/api/matches/:userId", getMatchesByUserId)
router.get("/api/your/matches/:userId", getMatchesByUserId)

router.param("userId", userById)
module.exports = router;
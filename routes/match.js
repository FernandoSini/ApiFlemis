const express = require("express")
const router = express.Router();
const { userById } = require("../controllers/user")


//criando as rotas do match

router.get("/api/matches/:userId")
router.get("/api/your/matches/:userId")

route.params("userId", userById)
module.exports = router;
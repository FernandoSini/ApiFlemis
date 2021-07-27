const express = require("express")
const router = express.Router()
const { login, logout, register } = require("../controllers/auth")
const { userRegisterValidator } = require("../validator/index")

router.post("/user/login", login)
router.post("/eventowner/login")
router.post("/register", userRegisterValidator, register)
router.post("/register/eventowner")
router.get("/logout", logout);

module.exports = router;

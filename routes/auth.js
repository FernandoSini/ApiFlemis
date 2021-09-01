const express = require("express")
const router = express.Router()
const { login, logout, register, resetPassword, verifyUserExists } = require("../controllers/auth")
const { userRegisterValidator, passwordResetValidator } = require("../validator/index")

router.post("/user/login", login)
router.post("/register", userRegisterValidator, register)
router.get("/logout", logout);

router.post("/forgot-password/verify", verifyUserExists)
//rota para resetar a senha sem link
router.put("/forgot-password/reset", passwordResetValidator,resetPassword)

module.exports = router;

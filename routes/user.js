const express = require('express');
const router = express.Router();
const { userById, avatarUpload, targetUserById } = require("../controllers/user")
const { requireLogin } = require("../controllers/auth");


//criando as rotas
router.get("/api/users")
router.get("/api/users/get/:userId")
router.get("/api/users/gender/find/different/:gender")
router.get("/api/users/avatar/:userId")
router.get("/api/users/photos/:userId")
router.post("/api/users/:userId/upload/avatar", avatarUpload.single("img"))
router.post("/api/users/:userId/photo/upload")
router.delete("/api/users/delete/:userId")
router.put("/api/users/update/:userId")
router.put("/api/user/like/:targetUserId")

router.param("userId", userById)
router.param("targetUserId", targetUserById)

module.exports = router;
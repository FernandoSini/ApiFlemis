const express = require('express');
const router = express.Router();
const { userById, updateUser, targetUserById,
    getAvatar, avatarUpload, uploadAvatar,
    likeUser, getUserProfile, deleteUser,
    getUserByDifferentGender, hasAuthorization,
    getAllUsers,
    getLikes } = require("../controllers/user")
const { requireLogin } = require("../controllers/auth");


//criando as rotas
router.get("/api/users", getAllUsers)
router.get("/api/users/profile/:userId", requireLogin, getUserProfile)
router.put("/api/users/you/edit/:userId", requireLogin, hasAuthorization, updateUser)
router.get("/api/users/gender/find/different/", requireLogin, getUserByDifferentGender)
router.get("/api/users/photos/:userId")
router.put("/api/users/:userId/upload/avatar", requireLogin, hasAuthorization, avatarUpload.single("img"), uploadAvatar)
router.get("/api/users/:userId/avatar", requireLogin, getAvatar)
router.get("/api/users/likedBy/you", getLikes)
router.post("/api/users/:userId/photo/upload")
router.delete("/api/users/delete/:userId", requireLogin, hasAuthorization, deleteUser)
// router.put("/api/users/update/:userId", updateUser)
router.put("/api/user/:userId/like/:targetUserId", requireLogin, likeUser)

router.param("userId", userById)
router.param("targetUserId", targetUserById)

module.exports = router;
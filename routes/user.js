const express = require('express');
const router = express.Router();
const { userById, updateUser, targetUserById,
    getAvatar, avatarUpload, uploadAvatar,
    likeUser, getUserProfile, deleteUser,
    getUserByDifferentGender, hasAuthorization,
    getAllUsers,
    getLikes, getLikesReceived, uploadPhotos, deleteAvatar, } = require("../controllers/user")
const { requireLogin } = require("../controllers/auth");


//criando as rotas
router.get("/api/users", getAllUsers)
router.get("/api/users/profile/:userId", requireLogin, getUserProfile)
router.put("/api/users/you/edit/:userId", requireLogin, hasAuthorization, updateUser)
router.get("/api/users/gender/find/different?:gender", requireLogin, getUserByDifferentGender)
router.get("/api/users/photos/:userId")
router.get("/api/users/likes/received/:userId", requireLogin, hasAuthorization, getLikesReceived)
router.put("/api/users/:userId/upload/avatar", requireLogin, hasAuthorization, avatarUpload.single("img"), uploadAvatar)
router.put("/api/users/avatar/update/:userId", requireLogin, hasAuthorization, avatarUpload.single("img"), uploadAvatar)
router.get("/api/users/:userId/avatar", requireLogin, getAvatar)
router.get("/api/users/likedBy/you", requireLogin, getLikes)
router.post("/api/users/:userId/photo/upload", requireLogin, hasAuthorization, uploadPhotos)
router.delete("/api/users/delete/:userId", requireLogin, hasAuthorization, deleteUser)
// router.put("/api/users/update/:userId", updateUser)
router.put("/api/users/:userId/like/:targetUserId", requireLogin, hasAuthorization, likeUser)
router.delete("/api/users/:userId/avatar/delete", requireLogin, hasAuthorization, deleteAvatar)
router.delete("/api/users/:userId/photo/delete", requireLogin, hasAuthorization, deleteAvatar)
router.param("userId", userById)
router.param("targetUserId", targetUserById)

module.exports = router;
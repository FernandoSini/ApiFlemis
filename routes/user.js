const express = require('express');
const router = express.Router();


//criando as rotas

router.get("/api/users")
router.get("/api/users/get/:userId")
router.get("/api/users/gender/find/different/:gender")
router.get("/api/users/update/:userId")
router.get("/api/users/delete/:userId")
router.get("/api/users/avatar/:userId")
router.get("/api/users/photos/:userId")


module.exports = router;
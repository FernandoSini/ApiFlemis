const express = require('express');
const router = express.Router();


//criando as rotas

router.get("/api/users")
router.get("/api/users/gender/find/different/:gender")
router.get("/api/users/update/:userId")
router.get("/api/users/delete/:userId")
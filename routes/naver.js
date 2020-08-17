const express = require('express');

const naverController = require('../controllers/naver');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

//Get com filtro
router.get('/index/:filter', isAuth, naverController.getNaversFilter);

// Get All navers
router.get('/index', isAuth, naverController.getNavers); 

// Get One naver by id
router.get("/show/:naverId", isAuth, naverController.getNaver); 

// Create One Route
router.post("/store", isAuth, naverController.postNaver);

// Edit One Route PUT version
router.put("/update/:naverId", isAuth, naverController.updateNaver);

// Edit One Route PATCH version
//router.patch("/clients/:id", );

// Delete One Route
router.delete("/delete/:naverId", isAuth, naverController.deleteNaver);

module.exports = router;
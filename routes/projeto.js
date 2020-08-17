const express = require('express');

const projetoController = require('../controllers/projeto');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

//Get com filtro
router.get('/index/:filter', isAuth, projetoController.getProjetosFilter);

// Get All projetos
router.get('/index', isAuth, projetoController.getProjetos); 

// Get One naver by id
router.get("/show/:projetoId", isAuth, projetoController.getProjeto); 

// Create One Route
router.post("/store", isAuth, projetoController.postProjeto);

// Edit One Route PUT version
router.put("/update/:projetoId", isAuth, projetoController.updateProjeto);

// Edit One Route PATCH version
//router.patch("/clients/:id", );

// Delete One Route
router.delete("/delete/:projetoId", isAuth, projetoController.deleteProjeto);

module.exports = router;
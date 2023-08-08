const { createPdf } = require("../controllers/dnd5e.controller");

const router = require("express").Router();

router.post("/pdf", createPdf);

module.exports = router;
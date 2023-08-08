const { createPdf } = require("../controllers/fate-core.controller");

const router = require("express").Router();

router.post("/pdf", createPdf);

module.exports = router;

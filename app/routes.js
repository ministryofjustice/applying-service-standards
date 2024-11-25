const express = require('express')
const router = express.Router()


const contentController = require('./controllers/contentController.js');

router.get("/", contentController.g_home);
router.get("/:parent?/:slug", contentController.g_page);

module.exports = router
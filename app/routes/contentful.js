const express = require('express')
const router = express.Router()

const contentController = require('../controllers/contentController.js');
const searchController = require('../controllers/searchController.js');

router.get("/search", searchController.g_search)
router.get("/", contentController.g_home);
router.get("/:parent?/:slug", contentController.g_page);


module.exports = router

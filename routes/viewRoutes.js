const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

//Always validate is the user is logged in or not
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/login', viewsController.getLoginForm);
router.get('/tour/:slug', viewsController.getTour);

module.exports = router;

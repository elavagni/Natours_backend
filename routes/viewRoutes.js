const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

//If the route is not protected, validate is the user is logged in or not
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/me', authController.protect, viewsController.getAccount);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;

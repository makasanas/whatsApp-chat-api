/*
FileName : Index.js
Date : 4th Sep 2019
Description : This file consist of list of routes for the APIs
*/

/* DEPENDENCIES */
const express = require('express');
const router = express.Router();
const authCtrl = require('./../controllers/authCtrl');
const adminAuthCtrl = require('./../controllers/adminAuthCtrl');
const adminCtrl = require('./../controllers/adminCtrl');
const dbConnection = require('./../config/dbConnection');
const checkToken = require('./../middlewares/checkToken');
const cronCtrl = require('./../controllers/cronCtrl');
const shopifyCtrl = require('./../controllers/shopifyCtrl');
const recurringCtrl = require('./../controllers/recurringCtrl');
const productCtrl = require('./../controllers/productCtrl');
const contactCtrl = require('./../controllers/contactCtrl');



/*****************************
 Shopify
 *****************************/
router.get('/shopify/auth', checkToken.validateAcessToken, shopifyCtrl.auth);

/*****************************
 USERS
 *****************************/

/* Get User profile information */
router.get('/user/profile', checkToken.validateToken, authCtrl.getUserProfile);

router.get('/user/checktoken', checkToken.validateToken, authCtrl.checkToken);


/*****************************
 Recurring Plan
 *****************************/
router.post('/recurring/plan/', checkToken.validateToken,  recurringCtrl.create);

router.get('/recurring/plan/', checkToken.validateToken,  recurringCtrl.getPlan);

router.post('/recurring/plan/active/:planId', checkToken.validateToken,  recurringCtrl.activePlan);


/*****************************
  Product Get
 *****************************/
router.get('/products', checkToken.validateToken,  productCtrl.get);

router.get('/collections', checkToken.validateToken,  productCtrl.getCollection);

router.get('/getproductcount', checkToken.validateToken,  productCtrl.getProductCount);

/*****************************
  Contact
 *****************************/
router.post('/contact', checkToken.validateToken,  contactCtrl.creat);


/*****************************
 Webhook
 *****************************/

// router.post('/webhooks/app/delete', checkToken.validateWebhook, shopifyCtrl.deleteApp);

router.post('/webhooks/app/delete',  shopifyCtrl.deleteApp);



/*****************************
 ADMIN
 *****************************/

router.post('/admin/login',  adminAuthCtrl.login);

router.get('/admin/profile', checkToken.validateToken,  checkToken.isAdminUser, adminAuthCtrl.getUserProfile);

router.post('/admin/forgetPassword', adminAuthCtrl.forgetPassword);

router.post('/admin/reset/:token', adminAuthCtrl.resetPassword);

router.get('/admin/access_token', checkToken.validateToken,  checkToken.isAdminUser, adminAuthCtrl.generateAccessToken);



/*****************************
 ADMIN Other routes
 *****************************/

router.get('/admin/user', checkToken.validateToken,  checkToken.isAdminUser,  adminCtrl.getUsers);

/*****************************
 Setting Sync Product
 *****************************/

router.get('/syncProducts', checkToken.validateToken, productCtrl.syncProducts);


module.exports = router;
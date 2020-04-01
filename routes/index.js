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
const checkPlan = require('./../middlewares/checkPlan');
const cronCtrl = require('./../controllers/cronCtrl');
const shopifyCtrl = require('./../controllers/shopifyCtrl');
const recurringCtrl = require('./../controllers/recurringCtrl');
const productCtrl = require('./../controllers/productCtrl');
const productTypeCtrl = require('./../controllers/productTypeCtrl');
const contactCtrl = require('./../controllers/contactCtrl');
const syncCtrl = require('../controllers/syncCtrl');
const emailCtrl = require('../controllers/emailCtrl');


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
router.post('/recurring/plan/', checkToken.validateToken, recurringCtrl.create);

router.get('/recurring/plan/', checkToken.validateToken, recurringCtrl.getPlan);

router.post('/recurring/plan/active/:planId', checkToken.validateToken, recurringCtrl.activePlan);


/*****************************
  Product Get
 *****************************/

router.get('/sync/products', checkToken.validateToken, checkPlan.isValidPlan, productCtrl.syncProducts);

router.get('/products', checkToken.validateToken, productCtrl.getProduct);


/*****************************
  Product Type
 *****************************/


router.get('/producttype', checkToken.validateToken, productTypeCtrl.getProductType);



/*****************************
 Sync
 *****************************/

router.get('/syncDetails', checkToken.validateToken, syncCtrl.syncDetails);


/*****************************
  Contact
 *****************************/
router.post('/contact', checkToken.validateToken, contactCtrl.creat);


/*****************************
 Webhook
 *****************************/

if (process.env.NODE_ENV === 'prod') {
  router.post('/webhooks/app/delete', checkToken.validateWebhook, shopifyCtrl.deleteApp);
} else {
  router.post('/webhooks/app/delete', shopifyCtrl.deleteApp);
}


/*****************************
 ADMIN
 *****************************/

router.post('/admin/login', adminAuthCtrl.login);

router.get('/admin/profile', checkToken.validateToken, checkToken.isAdminUser, adminAuthCtrl.getUserProfile);

// router.post('/admin/forgetPassword', adminAuthCtrl.forgetPassword);

// router.post('/admin/reset/:token', adminAuthCtrl.resetPassword);




/*****************************
 ADMIN Other routes
 *****************************/

router.get('/admin/user', checkToken.validateToken, checkToken.isAdminUser, adminCtrl.getUsers);

router.get('/admin/access_token', checkToken.validateToken, checkToken.isAdminUser, adminCtrl.generateAccessToken);

router.get('/admin/deleteduser', checkToken.validateToken, checkToken.isAdminUser, adminCtrl.getDeletedUsers);


/*****************************
 APP Status routes
 *****************************/
router.get('/appStatus', shopifyCtrl.getEnabledApp);

router.put('/appStatus', checkToken.validateToken, shopifyCtrl.changeAppStatus);


/*****************************
 EMAIL NOTIFICATION 
 *****************************/
router.post('/sendmail/deletedUser', emailCtrl.deletedUser)
router.post('/sendmail/appUpdates', emailCtrl.appUpdates)

module.exports = router;
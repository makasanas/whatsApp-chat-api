/*
FileName : Index.js
Date : 4th Sep 2019
Description : This file consist of list of routes for the APIs
*/

/* DEPENDENCIES */
const express = require('express');
const router = express.Router();
const authCtrl = require('./../controllers/authCtrl');
const dbConnection = require('./../config/dbConnection');
const checkToken = require('./../middlewares/checkToken');
const shopifyCtrl = require('./../controllers/shopifyCtrl');
const recurringCtrl = require('./../controllers/recurringCtrl');
const productCtrl = require('./../controllers/productCtrl');
const contactCtrl = require('./../controllers/contactCtrl');



/*****************************
 Shopify
 *****************************/
router.get('/shopify/auth', shopifyCtrl.auth);

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

router.post('/recurring/plan/active/:planId', checkToken.validateToken,  recurringCtrl.activePlanSchema);

router.delete('/recurring/plan/deactive/', checkToken.validateToken,  recurringCtrl.deactivePlanSchema);


/*****************************
  Product Get
 *****************************/
router.get('/products', checkToken.validateToken,  productCtrl.get);

router.get('/collections', checkToken.validateToken,  productCtrl.getCollection);

router.post('/product/description', checkToken.validateToken,  productCtrl.getDescription);


/*****************************
  Contact
 *****************************/
router.post('/contact', checkToken.validateToken,  contactCtrl.creat);


/*****************************
 Webhook
 *****************************/

router.post('/webhooks/app/delete', checkToken.validateWebhook,   shopifyCtrl.deleteApp);

module.exports = router;
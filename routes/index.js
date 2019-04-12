/*
FileName : Index.js
Date : 2nd Aug 2018
Description : This file consist of list of routes for the APIs
*/

/* DEPENDENCIES */
const express = require('express');
const router = express.Router();
const authCtrl = require('./../controllers/authCtrl');
const productCtrl = require('./../controllers/productCtrl');
const dbConnection = require('./../config/dbConnection');
const checkToken = require('./../middlewares/checkToken');
const fileHandler = require('./../helpers/fileHandler');
const shopifyCtrl = require('./../controllers/shopifyCtrl');
const recurringCtrl = require('./../controllers/recurringCtrl');

/*****************************
 Shopify
 *****************************/
router.get('/shopify/auth', shopifyCtrl.auth);
router.post('/shopify/setPassword', checkToken.validateToken, shopifyCtrl.setPassword);
router.get('/shopify/products', checkToken.validateToken, shopifyCtrl.getProducts);
router.post('/shopify/products', checkToken.validateToken, shopifyCtrl.insertProducts);




/*****************************
 USERS
 *****************************/

/* Authenticate User */
router.post('/shopify/login', authCtrl.login);

/* Get User profile information */
router.get('/user/profile', checkToken.validateToken, authCtrl.getUserProfile);

/* Put user by id */
router.put('/user/:userId', checkToken.validateToken, checkToken.isAdminUser, authCtrl.userUpdate);

/* user password update */
router.put('/user/updatepassword/:userId', checkToken.validateToken, checkToken.isAdminUser, authCtrl.userPasswordUpdate);



/*****************************
 RESTAURANTS
 *****************************/

/* Create a new product */
router.post('/products', checkToken.validateToken, checkToken.planCheck,  productCtrl.createNewProduct);

/* Get list of products */
router.get('/products', checkToken.validateToken,  productCtrl.getListOfProductsOwned);

// get product count 
router.get('/products/count', checkToken.validateToken,  productCtrl.getCount);

/* Get product detail by id */
router.get('/products/:productId', checkToken.validateToken, productCtrl.getProductDetails);

/* Update product details by id */
router.put('/products/:productId', checkToken.validateToken, productCtrl.updateProductDetails);

/* Delete a product */
router.delete('/products/:productId', checkToken.validateToken,  productCtrl.deleteProduct);

router.post('/webhooks/orders/create', checkToken.validateToken,  productCtrl.orders);



router.post('/recurring/plan/', checkToken.validateToken,  recurringCtrl.create);

router.get('/recurring/plan/', checkToken.validateToken,  recurringCtrl.getPlan);

router.post('/recurring/plan/active/:planId', checkToken.validateToken,  recurringCtrl.activePlan);

router.delete('/recurring/plan/deactive/:planId', checkToken.validateToken,  recurringCtrl.deactivePlan);


module.exports = router;
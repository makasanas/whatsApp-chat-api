/*
FileName : Index.js
Date : 2nd Aug 2018
Description : This file consist of list of routes for the APIs
*/

/* DEPENDENCIES */
const express = require('express');
const router = express.Router();
const dbConnection = require('./../config/dbConnection');
const authCtrl = require('./../controllers/authCtrl');
const productCtrl = require('./../controllers/productCtrl');
const checkToken = require('./../middlewares/checkToken');
const fileHandler = require('./../helpers/fileHandler');
const commentsCtrl = require('./../controllers/commentsCtrl');
const adminCtrl = require('./../controllers/adminCtrl');
const shopifyCtrl = require('./../controllers/shopifyCtrl');


/*****************************
 Shopify
 *****************************/
// router.get('/shopify/accesstoken', shopifyCtrl.accessToken);
// router.get('/shopify/install', shopifyCtrl.install);
router.get('/shopify/auth', shopifyCtrl.auth);
// router.get('/shopify/app', shopifyCtrl.app);
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
router.post('/products', checkToken.validateToken,  productCtrl.createNewProduct);

/* Get list of products */
router.get('/products', checkToken.validateToken,  productCtrl.getListOfProductsOwned);

/* Get product detail by id */
router.get('/products/:productId', checkToken.validateToken, productCtrl.getProductDetails);

/* Update product details by id */
router.put('/products/:productId', checkToken.validateToken, productCtrl.updateProductDetails);

/* Delete a product */
router.delete('/products/:productId', checkToken.validateToken,  productCtrl.deleteProduct);


module.exports = router;
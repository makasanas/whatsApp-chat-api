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
const restaurantCtrl = require('./../controllers/restaurantCtrl');
const checkToken = require('./../middlewares/checkToken');
const fileHandler = require('./../helpers/fileHandler');
const commentsCtrl = require('./../controllers/commentsCtrl');
const adminCtrl = require('./../controllers/adminCtrl');
const shopifyCtrl = require('./../controllers/shopifyCtrl');


/*****************************
 Shopify
 *****************************/
router.get('/shopify/accesstoken', shopifyCtrl.accessToken);
router.get('/shopify/install', shopifyCtrl.install);
router.get('/shopify/auth', shopifyCtrl.auth);
router.get('/shopify/app', shopifyCtrl.app);
router.get('/shopify/setPassword', shopifyCtrl.setPassword);
router.get('/shopify/products', shopifyCtrl.getProducts);



/*****************************
 USERS
 *****************************/
router.post('/user/login', authCtrl.login);

/* Authenticate User */
router.post('/user/login', authCtrl.login);

/* Register new User */
router.post('/user/register', authCtrl.register);

/* Get User profile information */
router.get('/user/profile', checkToken.validateToken, authCtrl.getUserProfile);

/* Put user by id */
router.put('/user/:userId', checkToken.validateToken, checkToken.isAdminUser, authCtrl.userUpdate);

/* user password update */
router.put('/user/updatepassword/:userId', checkToken.validateToken, checkToken.isAdminUser, authCtrl.userPasswordUpdate);

module.exports = router;
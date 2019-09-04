/*
FileName : Index.js
Date : 2nd Aug 2018
Description : This file consist of list of routes for the APIs
*/

/* DEPENDENCIES */
const express = require('express');
const router = express.Router();
const authCtrl = require('./../controllers/authCtrl');
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

/* Get User profile information */
router.post('/user/forgetPassword', authCtrl.forgetPassword);

router.post('/user/reset/:token', authCtrl.resetPassword);
//
router.get('/checkuserexist/:shopUrl', authCtrl.checkUserExist);


/*****************************
 Recurring Plan
 *****************************/

router.post('/recurring/plan/', checkToken.validateToken,  recurringCtrl.create);

router.get('/recurring/plan/', checkToken.validateToken,  recurringCtrl.getPlan);

router.post('/recurring/plan/active/:planId', checkToken.validateToken,  recurringCtrl.activePlanSchema);

router.delete('/recurring/plan/deactive/', checkToken.validateToken,  recurringCtrl.deactivePlanSchema);


module.exports = router;
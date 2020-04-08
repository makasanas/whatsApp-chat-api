const { ApiResponse, SetError } = require('./../helpers/common');
const { handleError, comparePassword, generatePasswordHash, BulkMailWithTemplet } = require('./../helpers/utils');
const jwt = require('jsonwebtoken');
const commonModel = require('./../model/common');
var moment = require('moment');



/********************
 email With Templets
 ********************/

module.exports.deletedUser = async (req, res) => {
    let rcResponse = new ApiResponse();
    let dataId = '9429413323';
    try {
        if (req.body.id !== dataId) {
            throw SetError({}, 403, 'InvalidParams');
        }
        commonData = {};
        commonData['shopifyAppUrl'] = process.env.shopifyAppUrl;
        commonData['appName'] = process.env.appName;
        commonData['template'] = "bulkDelete";
        data = {};
        mailData = [];
        let userDetail = await commonModel.find('deletedUser', {});
        userDetail.forEach((UserData, index) => {
            data[UserData.email] = {
                'storeName': UserData.storeName,
                'appName': process.env.appName,
                'shopifyAppUrl': process.env.shopifyAppUrl,
                'id': index
            }
            mailData.push(UserData.email);
        });
        await BulkMailWithTemplet(commonData, data, mailData);
    } catch (err) {
        // console.log(err);
        // console.log(rcResponse);
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.appUpdates = async (req, res) => {
    let rcResponse = new ApiResponse();
    let dataId = '9429413323';
    try {
        if (req.body.id !== dataId) {
            throw SetError({}, 403, 'InvalidParams');
        }
        commonData = {};
        commonData['shopifyAppUrl'] = process.env.shopifyAppUrl;
        commonData['appName'] = process.env.appName;
        commonData['template'] = "bulkUpdate";
        data = {};
        mailData = [];
        let userDetail = await commonModel.find('user', {});
        userDetail.forEach((UserData, index) => {
            data[UserData.email] = {
                'storeName': UserData.storeName,
                'appName': process.env.appName,
                'id': index
            }
            mailData.push(UserData.email);
        });
        await BulkMailWithTemplet(commonData, data, mailData);
    } catch (err) {
        // console.log(err);
        // console.log(rcResponse);
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.regularAppReview = async (users) => {
    try {

        commonData = {};
        commonData['shopifyAppUrl'] = process.env.shopifyAppUrl;
        commonData['appName'] = process.env.appName;
        commonData['template'] = "regularReview";

        data = {};
        mailData = [];

        users.forEach((UserData, index) => {
            data[UserData.email] = {
                'storeName': UserData.storeName,
                'id': index
            }
            mailData.push(UserData.email);
        });

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.reviewMailCount == 0) {
                let nextReviewDate = moment(user.nextReviewDate).add(30, 'days');
                await commonModel.findOneAndUpdate('user', { _id: user._id }, { nextReviewDate: nextReviewDate, $inc: { reviewMailCount: 1 } });
            } else if (user.reviewMailCount == 1) {
                let nextReviewDate = moment(user.nextReviewDate).add(60, 'days');
                await commonModel.findOneAndUpdate('user', { _id: user._id }, { nextReviewDate: nextReviewDate });
            }
        }

        await BulkMailWithTemplet(commonData, data, mailData);
    } catch (err) {
        console.log(err);

    }
}

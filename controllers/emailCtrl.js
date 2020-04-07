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
        data = {};
        mailData = [];
        let userDetail = await commonModel.find('deletedUser', {});
        userDetail.forEach((UserData, index) => {
            data[UserData.email] = {
                'storeName': UserData.storeName,
                'appName': 'Announcement bar with Slider',
                'id': index
            }
            mailData.push(UserData.email);
        });
        await BulkMailWithTemplet(data, mailData, "bulkDelete")
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
        await BulkMailWithTemplet(data, mailData, "bulkUpdate")
    } catch (err) {
        // console.log(err);
        // console.log(rcResponse);
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.regularAppReview = async (users) => {
    console.log(users);
    try {
        data = {};
        mailData = [];
        users.forEach((UserData, index) => {
            data[UserData.email] = {
                'storeName': UserData.storeName,
                'appName': process.env.appName,
                'id': index
            }
            mailData.push(UserData.email);
        });

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            console.log(user);
            if (user.reviewMailCount == 0) {
                let nextReviewDate = moment(user.nextReviewDate).add(30, 'days');
                await commonModel.findOneAndUpdate('user', { _id: user._id }, { nextReviewDate: nextReviewDate, $inc: { reviewMailCount: 1 } });
            } else if (user.reviewMailCount == 1) {
                let nextReviewDate = moment(user.nextReviewDate).add(60, 'days');
                await commonModel.findOneAndUpdate('user', { _id: user._id }, { nextReviewDate: nextReviewDate });
            }
            console.log(user);

        }

        // await BulkMailWithTemplet(data, mailData, "regularReview");
    } catch (err) {
        console.log(err);

    }
}

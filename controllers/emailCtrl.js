const { ApiResponse, SetError } = require('./../helpers/common');
const { handleError, comparePassword, generatePasswordHash, BulkMailWithTemplet } = require('./../helpers/utils');
const jwt = require('jsonwebtoken');
const commonModel = require('./../model/common');



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
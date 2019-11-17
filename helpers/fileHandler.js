/*
FileName : fileHandler.js
Date : 2nd Aug 2018
Description : This file consist of files related functions
*/

/* DEPENDENCIES */
const multer = require('multer');
const path = require('path');
const appDir = path.dirname(require.main.filename);
const { SetError, ApiResponse } = require('./../helpers/common');
const { handleError } = require('./utils');

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, appDir + '/../public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage: storage }).fields([
  { name: 'file', maxCount: 1 }
]);

module.exports.uploadObj = upload;

module.exports.uploadMedia = async (req, res) => {
  let rcResponse = new ApiResponse();
  try {
    if (!req.files || !req.files.file) {
      throw SetError({}, 400, 'InvalidParams');
    }
    rcResponse.message = 'Media file has been successfullly uploaded';
    rcResponse.data = { fileName: req.files.file[0].filename }
  } catch (err) {
    handleError(err, rcResponse);
  }
  return res.status(rcResponse.code).send(rcResponse);
};
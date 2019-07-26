/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const sessionModel = require('./../models/sessionModel');
const ObjectId = require('mongoose').Types.ObjectId; 

/* Create Session */
module.exports.createSession = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    if(!req.body) {
        SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
        httpStatus = 400;
    }
    try {
        let session = new sessionModel({
            sessionData: req.body.sessionData,
            productId: req.body.productId
        })
        await session.save().then((data) => {
            console.log(data);
            rcResponse.data = data;
        })
        
    }
    catch(err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
		httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
  };

  /* Update session */
  module.exports.updateSession = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    if(!req.body) {
        SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
        httpStatus = 400;
    }
    try {
        await sessionModel.findByIdAndUpdate(req.params._id, {
            sessionData: req.body.sessionData
        }, {new: true})
        .then(session => {
            if(!session) {
                return res.status(404).send({
                    message: "Note not found with id " + req.params.noteId
                });
            }
            rcResponse.data = session;
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                httpStatus = 404;
                rcResponse.data = {
                    message: "Session not found with id " + req.params._id
                };                
            }
        });
    }
    catch(err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
		httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
  }

  /* Get session */
  module.exports.getSession = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    if(!req.body) {
        SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
        httpStatus = 400;
    }
    try {
		await sessionModel.findOne({ _id: ObjectId(req.params._id), 'productId': req.params.productId}, function(err, obj) {
            console.log(obj);
            console.log(err);
        const sessionData = obj;
		rcResponse.data = sessionData;
        })
		
    }
    catch(err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
		httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
  };
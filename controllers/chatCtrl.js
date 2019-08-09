/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const sessionModel = require('./../models/sessionModel');
const ObjectId = require('mongoose').Types.ObjectId; 

/* Create Session */
module.exports.createSession = async (data) => {
    let rcResponse = new ApiResponse();
    try {
        let session = new sessionModel({
            productId: data.productId,
            shopUrl: data.shopUrl
        })

        await session.save().then((data) => {
            rcResponse.data = data;
        })
        
    }
    catch(err) {
        return rcResponse;
    }

    return rcResponse.data;
  };


module.exports.findAndUpdateSession = async (data) => {
    let rcResponse = new ApiResponse();
    try {
        let updateData = {$push: { sessionData: data }}
        data.count ? updateData.count = data.count : null ;
        data.maxBargainingCount ? updateData.maxBargainingCount = data.maxBargainingCount : null ;
        data.lastOffer ? updateData.lastOffer = data.lastOffer : null ;
        
        console.log(updateData);
        await sessionModel.findByIdAndUpdate(ObjectId(data.session), updateData , {new: true})
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
        return rcResponse.data;
    }
    return rcResponse.data;
 };

 module.exports.findSession = async (data) => {
    let rcResponse = new ApiResponse();
    try {
        await sessionModel.findById(ObjectId(data.session)).then(session => {
            if(!session) {
                return res.status(404).send({
                    message: "Note not found with id " + req.params.noteId
                });
            }
            console.log("anasew");
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
        return rcResponse.data;
    }
    console.log("return");

    return rcResponse.data;
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
		await sessionModel.findOne({ _id: ObjectId(req.params._id), 'productId': req.params.productId}).select('-sessionData.count -sessionData.maxBargainingCount').exec(function (err, obj) {
            console.log(obj);
            console.log(err);
            const sessionData = obj;
            rcResponse.data = sessionData;
            return res.status(httpStatus).send(rcResponse);

        })
    }catch(err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
        return res.status(httpStatus).send(rcResponse);
    }
    console.log("httpStatus");
  };
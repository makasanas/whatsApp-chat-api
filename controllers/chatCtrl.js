/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const sessionSchema = require('./../schema/session');
const sessionModel = require('./../model/session');



const ObjectId = require('mongoose').Types.ObjectId; 

/* Create Session */
module.exports.createSession = async (data) => {
    let rcResponse = new ApiResponse();
    try {
        let session = new sessionSchema({
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
        
        await sessionSchema.findByIdAndUpdate(ObjectId(data.session), updateData , {new: true})
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
        await sessionSchema.findById(ObjectId(data.session)).then(session => {
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


  /* Update session */
  module.exports.updateSession = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    if(!req.body) {
        SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
        httpStatus = 400;
    }
    try {
        await sessionSchema.findByIdAndUpdate(req.params._id, {
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

    try {
        const session = await sessionModel.findSessionByIdAndProductId(req.params._id, req.params.productId);
        if (!session) {
          SetResponse(rcResponse, 404, RequestErrorMsg('sessionNotFound', req, null), false);
        }

        rcResponse.data = session;
    }catch(err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
        return res.status(httpStatus).send(rcResponse);
    }
    return res.status(httpStatus).send(rcResponse);

  };


  
  module.exports.findAndClearSession = async (data) => {
    let rcResponse = new ApiResponse();
    try {
        await sessionSchema.findById(ObjectId(data.session), async function (err, session) {
            if(err){
                SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
                httpStatus = 500;
                return res.status(httpStatus).send(rcResponse);
            }

            if(Date.now(session.sessionData[session.sessionData.length -1].created) < Date.now() - (5*24*3600000)){
                session.sessionData = [];
                session.maxBargainingCount = undefined;
                session.lastOffer = undefined;
                session.count = undefined;
            }

            rcResponse.data = session;
            await session.save();
        });
    }
    catch(err) {
        return rcResponse.data;
    }
    return rcResponse.data;
 };
const { ApiResponse } = require('./../helpers/common');
const { sendMail, handleError } = require('./../helpers/utils');

const contactModel = require('./../model/contact');


module.exports.creat = async (req, res) => {
	let rcResponse = new ApiResponse();
    let { body } = req;

	try {
        rcResponse.data = await contactModel.creat(body);
        rcResponse.data = JSON.parse(JSON.stringify(rcResponse.data));
        let  mailBody = "";
        Object.keys(rcResponse.data).forEach(function(key) {
            mailBody += key+': '+ rcResponse.data[key]+'\n '
        });
       await sendMail('makasanas@yahoo.in', mailBody ,  "message from on app");
	} catch (err) {
        handleError(err, req, rcResponse);
    }
    
	return res.status(rcResponse.code).send(rcResponse);
};
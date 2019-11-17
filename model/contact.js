const contactSchema = require('./../schema/contact');

module.exports.creat = async (data) => {
  try {
    return await new contactSchema(data).save();
  } catch (err) {
    throw err;
  }
}
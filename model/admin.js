const adminSchema = require('./../schema/admin');



module.exports.findOne = async (query) => {
  try {
    return await adminSchema.findOne(query).lean().exec();
  } catch (err) {
    throw err;
  }
}


module.exports.create = async (data) => {
  try {
    return await new adminSchema(data).save();
  } catch (error) {
    throw error;
  }
}

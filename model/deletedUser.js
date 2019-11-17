const deletedUserSchema = require('./../schema/deletedUser');


module.exports.findOneAndUpdate = async (query, data, fields) => {
  try {
    return await deletedUserSchema.findOneAndUpdate(query, data, { fields, setDefaultsOnInsert: true, new: true, upsert: true }).lean().exec();
  } catch (error) {
    throw error;
  }
}
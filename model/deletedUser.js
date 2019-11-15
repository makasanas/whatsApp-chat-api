const deletedUserSchema = require('./../schema/deletedUser');


module.exports.findOneAndUpdate = async (userObj) => {
    try {
      var query = { shopUrl:  userObj.shopUrl }, 
      options = { upsert: true, new: true, setDefaultsOnInsert: true };
      return await deletedUserSchema.findOneAndUpdate(query, userObj, options).lean().exec();
    } catch (err) {
      throw err;
    }
  }
const deletedUserSchema = require('./../schema/deletedUser');


module.exports.findOneAndUpdate = async (userObj) => {
    try {
      var query = { shopUrl:  userObj.shopUrl }, 
      options = { upsert: true, new: true, setDefaultsOnInsert: true };
     
      console.log(userObj);
      return await deletedUserSchema.findOneAndUpdate(query, userObj, options).lean().exec();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
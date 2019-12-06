const emailNotificationSchema = require('./../schema/emailNotification');

module.exports.creat = async (data) => {
  try {
    return await new emailNotificationSchema(data).save();
  } catch (err) {
    throw err;
  }
}

module.exports.findOneAndUpdate = async (query, data, fields) => {
  try {
    return await emailNotificationSchema.findOneAndUpdate(query, data, { fields, setDefaultsOnInsert: true, new: true, upsert: true });
  } catch (err) {
    throw err;
  }
}


module.exports.deleteMany = async (query) => {
  try {
    return await emailNotificationSchema.deleteMany(query);
  } catch (err) {
    throw err;
  }
}
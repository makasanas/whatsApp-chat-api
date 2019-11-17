const activePlanSchema = require('./../schema/activePlan');

module.exports.create = async (data) => {
  try {
    return await new activePlanSchema(data).save();
  } catch (error) {
    throw error;
  }
}

module.exports.findOneAndUpdate = async (query, data, fields) => {
  try {
    return await activePlanSchema.findOneAndUpdate(query, data, { fields, setDefaultsOnInsert: true, new: true, upsert: true });
  } catch (err) {
    throw err;
  }
}

module.exports.findOne = async (query) => {
  try {
    return await activePlanSchema.findOne(query).lean().exec();
  } catch (err) {
    throw err;
  }
}

module.exports.find = async (query) => {
  try {
    return await activePlanSchema.find(query).lean().exec();
  } catch (err) {
    throw err;
  }
}

module.exports.deleteMany = async (query) => {
  try {
      return await activePlanSchema.deleteMany(query);
  } catch (error) {
      throw error;
  }
}

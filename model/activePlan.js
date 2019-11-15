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

// module.exports.deleteManyByShopUrl = async (shopUrl) => {
//     try {
//       return await activePlanSchema.deleteMany({ shopUrl: shopUrl });
//     } catch (error) {
//       throw error;
//     }
//   }

//   module.exports.findActivePlanByUserId = async (userId) => {
//     try {
//       return await activePlanSchema.findOne({ userId: userId }).lean().exec();;
//     } catch (error) {
//       throw error;
//     }
//   }

//   module.exports.updatePlan = async (planId, data) => {
//     try {
//       return await activePlanSchema.findOneAndUpdate({ userId: planId }, data, { new: true }).lean().exec();
//     } catch (error) {
//       throw error;
//     }
//   }



//   module.exports.find = async (findQuery) => {
//     try {
//       return await activePlanSchema.find(findQuery).lean().exec();
//     } catch (error) {
//       throw error;
//     }
//   }
const sessionSchema = require('./../schema/session');


module.exports.deleteManyByShopUrl = async (shopUrl) => {
  try {
    return await sessionSchema.deleteMany({ shopUrl: shopUrl });
  } catch (error) {
    throw error;
  }
}


module.exports.findSessionByIdAndProductId = async (id, productId) => {
  try {
    return await sessionSchema.findOne({ _id: id, productId:productId }, { 'maxBargainingCount': 0, 'count': 0, 'lastOffer': 0  });
  } catch (error) {
    throw error;
  }
}
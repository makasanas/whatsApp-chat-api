const productTypeSchema = require('./../schema/productType');

module.exports.findOneAndUpdate = async (query, data) => {
    try {
        return await productTypeSchema.findOneAndUpdate(query, { $set: data }, { setDefaultsOnInsert: true, new: true, upsert: true }).lean().exec();
    } catch (error) {
        throw error;
    }
}

module.exports.deleteManyByShopUrl = async (shopUrl) => {
    try {
        return await productTypeSchema.deleteMany({ shopUrl: shopUrl });
    } catch (error) {
        throw error;
    }
}

module.exports.findOne = async (query) => {
    try {
        return await productTypeSchema.findOne(query);
    } catch (error) {
        throw error;
    }
}
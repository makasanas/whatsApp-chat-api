const productSyncDetailSchema = require('./../schema/productSyncDetail');

module.exports.create = async (syncDetail) => {
    try {
        return await new productSyncDetailSchema(syncDetail).save();
    } catch (error) {
        throw error;
    }
}

module.exports.find = async (query,sort) => {
    try {
        return await productSyncDetailSchema.find(query).sort(sort);
    } catch (error) {
        throw error;
    }
}
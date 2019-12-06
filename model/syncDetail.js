const syncDetailSchema = require('../schema/syncDetail');

module.exports.create = async (syncDetail) => {
    try {
        return await new syncDetailSchema(syncDetail).save();
    } catch (error) {
        throw error;
    }
}

module.exports.findOne = async (query) => {
    try {
        return await syncDetailSchema.findOne(query);
    } catch (error) {
        throw error;
    }
}

module.exports.find = async (query, sort) => {
    try {
        return await syncDetailSchema.find(query).sort(sort);
    } catch (error) {
        throw error;
    }
}

module.exports.findOneAndUpdate = async (query, data, fields) => {
    try {
        return await syncDetailSchema.findOneAndUpdate(query, data, { fields, setDefaultsOnInsert: true, new: true, upsert: true }).lean().exec();
    } catch (error) {
        throw error;
    }
}

module.exports.deleteMany = async (query) => {
    try {
        return await syncDetailSchema.deleteMany(query);
    } catch (error) {
        throw error;
    }
}
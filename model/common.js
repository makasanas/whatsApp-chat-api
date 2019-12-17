module.exports.user = require('./../schema/user');
module.exports.syncDetail = require('./../schema/syncDetail');
module.exports.product = require('./../schema/product');
module.exports.activePlan = require('./../schema/activePlan');
module.exports.emailNotification = require('./../schema/emailNotification');
module.exports.deletedUser = require('./../schema/deletedUser');
module.exports.product = require('./../schema/product');
module.exports.productType = require('./../schema/productType');

module.exports.findOne = async (collection, query, property) => {
    try {
        return await this[collection].findOne(query, property).lean().exec();
    } catch (err) {
        throw err;
    }
}

module.exports.create = async (collection, data) => {
    try {
        return await new this[collection](data).save();
    } catch (error) {
        throw error;
    }
}

module.exports.findOneAndUpdate = async (collection, query, data, fields) => {
    try {
        return await this[collection].findOneAndUpdate(query, data, { fields, setDefaultsOnInsert: true, new: true, upsert: true }).lean().exec();
    } catch (error) {
        throw error;
    }
}

module.exports.findWithCount = async (collection, query, userQuery, skip, limit, sort) => {
    try {
        return await this[collection].aggregate([
            {
                "$facet": {
                    "query": [
                        {
                            $match: {
                                $and: [
                                    query,
                                    userQuery
                                ]
                            }
                        },
                        { $sort: sort },
                        {
                            $skip: skip
                        }, {
                            $limit: limit
                        }
                    ],
                    "queryCount": [
                        {
                            $match: {
                                $and: [
                                    query,
                                    userQuery
                                ]
                            }
                        },
                        { "$count": "Total" },
                    ]
                }
            },
            {
                "$project": {
                    "users": "$query",
                    "count": { "$arrayElemAt": ["$queryCount.Total", 0] },
                }
            }
        ])
    } catch (err) {
        throw err;
    }
}

module.exports.deleteMany = async (collection, query) => {
    try {
        return await this[collection].deleteMany(query);
    } catch (error) {
        throw error;
    }
}
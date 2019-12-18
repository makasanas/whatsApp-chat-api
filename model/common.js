module.exports.user = require('./../schema/user');
module.exports.syncDetail = require('./../schema/syncDetail');
module.exports.product = require('./../schema/product');
module.exports.activePlan = require('./../schema/activePlan');
module.exports.emailNotification = require('./../schema/emailNotification');
module.exports.deletedUser = require('./../schema/deletedUser');
module.exports.productType = require('./../schema/productType');
module.exports.admin = require('./../schema/admin');
module.exports.contact = require('./../schema/contact');


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

module.exports.find = async (collection, query, sort, limit, skip) => {
    try {
        return await this[collection].find(query).sort(sort).limit(limit).skip(skip);
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


module.exports.findWithCount = async (collection, query, skip, limit, sort) => {
    try {
        return await this[collection].aggregate([
            {
                $match: {
                    $and: query
                }
            },
            { $sort: sort },
            {
                $facet: {
                    products: [{ $skip: skip }, { $limit: limit }],
                    count: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            },
            {
                "$project": {
                    [collection]: "$products",
                    "count": { "$arrayElemAt": ["$count.count", 0] },
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

module.exports.bulkWrite = async (collection, data) => {
    try {
        return await this[collection].bulkWrite(data);
    } catch (error) {
        throw error;
    }
}
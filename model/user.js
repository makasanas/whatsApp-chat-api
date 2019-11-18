const userSchema = require('./../schema/user');

module.exports.findOne = async (query, property) => {
  try {
    return await userSchema.findOne(query, property).lean().exec();
  } catch (err) {
    throw err;
  }
}

module.exports.create = async (data) => {
  try {
    return await new userSchema(data).save();
  } catch (error) {
    throw error;
  }
}

module.exports.findOneAndUpdate = async (query, data, fields) => {
  try {
    return await userSchema.findOneAndUpdate(query, data, { fields, setDefaultsOnInsert: true, new: true, upsert: true }).lean().exec();
  } catch (error) {
    throw error;
  }
}


module.exports.findWithCount = async (query, userQuery, skip, limit, sort) => {
  try {
    return await userSchema.aggregate([
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


module.exports.deleteMany = async (query) => {
  try {
      return await userSchema.deleteMany(query);
  } catch (error) {
      throw error;
  }
}
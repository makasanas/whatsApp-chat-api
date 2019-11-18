const deletedUserSchema = require('./../schema/deletedUser');


module.exports.findOneAndUpdate = async (query, data, fields) => {
  try {
    return await deletedUserSchema.findOneAndUpdate(query, data, { fields, setDefaultsOnInsert: true, new: true, upsert: true }).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.findWithCount = async (query, userQuery, skip, limit, sort) => {
  try {
    return await deletedUserSchema.aggregate([
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

const productSchema = require('./../schema/product');

module.exports.getCount = async (userQuery) => {
  try {
    return await productSchema.aggregate([
      {
        "$facet": {
          "all": [
            { $match: { $and: [userQuery] } },
            { "$count": "all" },
          ]
        }
      },
      {
        "$project": {
          "all": { "$arrayElemAt": ["$all.all", 0] }
        }
      }
    ])
  } catch (err) {
    throw err;
  }
}
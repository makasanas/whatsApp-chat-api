const productSchema = require('./../schema/product');

module.exports.syncProducts = async (productObj) => {
  try {
    return await productSchema.findOneAndUpdate({ productId: productObj.productId }, { $set: productObj }, { new: true, upsert: true }).lean().exec();
  } catch (error) {
    throw error;
  }
}


module.exports.bulkWrite = async (data) => {
  try {
    return await productSchema.bulkWrite(data);
  } catch (error) {
    throw error;
  }
}

module.exports.getProductFilter = async (query, userQuery, skip, limit, sort) => {
  try {
    return await productSchema.aggregate([
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
          "products": "$query",
          "count": { "$arrayElemAt": ["$queryCount.Total", 0] },
        }
      }
    ])
  } catch (error) {
    console.log(error);
    throw error;
  }
}



module.exports.deleteMany = async (query) => {
  try {
      return await productSchema.deleteMany(query);
  } catch (error) {
      throw error;
  }
}

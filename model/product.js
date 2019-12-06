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

module.exports.findWithCount = async (query, userQuery, skip, limit, sort) => {
  try {
    return await productSchema.aggregate([
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
          "products": "$products",
          "count": { "$arrayElemAt": ["$count.count", 0] },
        }
      }
    ])
  } catch (err) {
    throw err;
  }
}


module.exports.deleteMany = async (query) => {
  try {
    return await productSchema.deleteMany(query);
  } catch (error) {
    throw error;
  }
}

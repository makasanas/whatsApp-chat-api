const productSchema = require('./../schema/product');


module.exports.creat = async (productObj) => {
  try {
    const singleProduct = productSchema.findOneAndUpdate({ productId: product.productId }, {$set : product } , { new: true, upsert:true }).lean().exec();
    resolve(singleProduct);
    // const product = await new productSchema(productObj);
    // const productSave = await product.save();
    return productSave;
  } catch (error) {
    throw error;
  }
}

module.exports.find = async (query) => {
  try {
    const products  = await productSchema.find(query).lean().exec();;
    return products;
  } catch (error) {
    throw error;
  }
}

module.exports.deleteManyByShopUrl = async (shopUrl) => {
  try {
    return await productSchema.deleteMany({ shopUrl: shopUrl });
  } catch (error) {
    throw error;
  }
}

module.exports.deleteManyByProductId = async (products) => {
  try {
    return await productSchema.deleteMany({ productId:{'$in': products}});
  } catch (error) {
    throw error;
  }
}

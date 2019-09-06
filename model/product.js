const productSchema = require('./../schema/product');


module.exports.creat = async (productObj) => {
    try {
      const product = await new productSchema(productObj);
      const productSave = await product.save();
      return  productSave;
    } catch (error) {
      throw error;
    }
}
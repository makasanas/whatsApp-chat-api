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

datafunctiom = (product) =>{
  return new Promise(async(resolve) => {
    const singleProduct = productSchema.findOneAndUpdate({ productId: product.productId }, {$set : product } , { new: true, upsert:true }).lean().exec();
    resolve(singleProduct);
  });
}

module.exports.insertMany = async (productObj) => {
  try {
    let data = [];
    let startDate = new Date().getTime();
    let allPromise = [];
   
    for (const product of productObj) {
      allPromise.push(datafunctiom(product));
      // const singleProduct = productSchema.findOneAndUpdate({ productId: product.productId }, {$set : product } , { new: true, upsert:true }).lean().exec();
      // console.log(singleProduct);
      // data.push(singleProduct);
    }

    return Promise.all(allPromise).then((result)=>{
      console.log("result");
      console.log(result);
      console.log(new Date().getTime() - startDate);
      return result;

    }).catch(err=>{
      console.log(err);
    })

  } catch (error) {
    throw error;
  }
}
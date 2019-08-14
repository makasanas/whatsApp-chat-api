/*
FileName : planManage.js
Date : 8th Aug 2019
Description : This file consist of functions that can be used through the application for Recurring Plans
*/

const activePlanSchema = require('../schema/activePlan
const userModel = require('./../schema/user');
const productSchema = require('../schema/product


const managePlane = async (applicationCharge) => {
    let productCount = 0;
    if (applicationCharge.name == "Free") {
        productCount = process.env.Free;
    } else if (applicationCharge.name == "Silver") {
        productCount = process.env.Silver;
    } else if (applicationCharge.name == "Gold") {
        productCount = process.env.Gold;
    } else {
        productCount = process.env.Platinium;
    }
    let data = {
        shopUrl: decoded.shopUrl,
        userId: decoded.id,
        planName: applicationCharge.name,
        planId: applicationCharge.id,
        planPrice: applicationCharge.price,
        status: applicationCharge.status,
        started: applicationCharge.activated_on,
        nextBillDate: applicationCharge.activated_on,
        cancelled_on: applicationCharge.cancelled_on,
        products: productCount,
        type: 'monthly'
    }

    const findPlan = await activePlanSchema.findOne({ userId: decoded.id }).lean().exec();

    if (findPlan) {
        const updatePlan = await activePlanSchema.findOneAndUpdate({ _id: findPlan._id }, { $set: data }, { new: true }).lean().exec();

        let totalProducts = await productSchema.find({ userId: decoded.id });
        if (findPlan.products > productCount) {
            let deleteProduct = totalProducts.slice(productCount, totalProducts.length);
            let updatableProducts = deleteProduct.map(product => product._id);

            const updateProducts = await productSchema.updateMany({ _id: { $in: updatableProducts } }, { $set: { deleted: true } }, { multi: true });
        }

        let userPlanData = {
            recurringPlanName: applicationCharge.name,
            recurringPlanId: updatePlan._id
        }
        const updateUserPlan = await userModel.findOneAndUpdate({ _id: decoded.id }, { $set: userPlanData }, { new: true }).lean().exec();

        return updatePlan;
    } else {
        const plan = new activePlanSchema(data);
        const planSave = await plan.save();

        let userPlanData = {
            recurringPlanName: applicationCharge.name,
            recurringPlanId: planSave._id
        }
        const updateUserPlan = await userModel.findOneAndUpdate({ _id: decoded.id }, { $set: userPlanData }, { new: true }).lean().exec();

        return planSave;
    }
}

module.exports = {
    managePlane
  };


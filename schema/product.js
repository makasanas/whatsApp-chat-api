/*
FileName : productModel.js
Date : 11th March 2019
Description : This file consist of Product's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    shopUrl: { type: String, required: true },
    productId: { type: Number, unique: true, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    info: {
        "kind": { type: String, default: "content#product" },
        "id": { type: String },
        "offerId": { type: String },
        "source": { type: String },
        "identifierExists": { type: Boolean },
        "isBundle": { type: Boolean },
        "title": { type: String },
        "description": { type: String },
        "link": { type: String },
        "mobileLink": { type: String },
        "imageLink": { type: String },
        "additionalImageLinks": [
            { type: String }
        ],
        "contentLanguage": { type: String },
        "targetCountry": { type: String },
        "channel": { type: String },
        "expirationDate": { type: String },
        "adult": { type: Boolean },
        "ageGroup": { type: String },
        "availability": { type: String },
        "availabilityDate": { type: String },
        "brand": { type: String },
        "color": { type: String },
        "condition": { type: String },
        "gender": { type: String },
        "googleProductCategory": { type: String },
        "gtin": { type: String },
        "itemGroupId": { type: String },
        "material": { type: String },
        "mpn": { type: String },
        "pattern": { type: String },
        "price": {
            "value": { type: String },
            "currency": { type: String }
        },
        "installment": {
            "months": { type: Number },
            "amount": {
                "value": { type: String },
                "currency": { type: String }
            }
        },
        "loyaltyPoints": {
            "name": { type: String },
            "pointsValue": { type: Number },
            "ratio": { type: Number }
        },
        "productTypes": [
            { type: String }
        ],
        "salePrice": {
            "value": { type: String },
            "currency": { type: String }
        },
        "salePriceEffectiveDate": { type: String },
        "sellOnGoogleQuantity": { type: Number },
        "shipping": [
            {
                "price": {
                    "value": { type: String },
                    "currency": { type: String }
                },
                "country": { type: String },
                "region": { type: String },
                "service": { type: String },
                "locationId": { type: Number },
                "locationGroupName": { type: String },
                "postalCode": { type: String }
            }
        ],
        "shippingWeight": {
            "value": { type: Number },
            "unit": { type: String }
        },
        "shippingLength": {
            "value": { type: Number },
            "unit": { type: String }
        },
        "shippingWidth": {
            "value": { type: Number },
            "unit": { type: String }
        },
        "shippingHeight": {
            "value": { type: Number },
            "unit": { type: String }
        },
        "maxHandlingTime": { type: Number },
        "minHandlingTime": { type: Number },
        "shippingLabel": { type: String },
        "transitTimeLabel": { type: String },
        "sizes": [
            { type: String }
        ],
        "sizeSystem": { type: String },
        "sizeType": { type: String },
        "taxes": [
            {
                "rate": { type: Number },
                "country": { type: String },
                "region": { type: String },
                "taxShip": { type: Boolean },
                "locationId": { type: Number },
                "postalCode": { type: String }
            }
        ],
        "taxCategory": { type: String },
        "energyEfficiencyClass": { type: String },
        "minEnergyEfficiencyClass": { type: String },
        "maxEnergyEfficiencyClass": { type: String },
        "unitPricingMeasure": {
            "value": { type: Number },
            "unit": { type: String }
        },
        "unitPricingBaseMeasure": {
            "value": { type: Number },
            "unit": { type: String }
        },
        "multipack": { type: Number },
        "adsGrouping": { type: String },
        "adsLabels": [
            { type: String }
        ],
        "adsRedirect": { type: String },
        "costOfGoodsSold": {
            "value": { type: String },
            "currency": { type: String }
        },
        "displayAdsId": { type: String },
        "displayAdsSimilarIds": [
            { type: String }
        ],
        "displayAdsTitle": { type: String },
        "displayAdsLink": { type: String },
        "displayAdsValue": { type: Number },
        "promotionIds": [
            { type: String }
        ],
        "customLabel0": { type: String },
        "customLabel1": { type: String },
        "customLabel2": { type: String },
        "customLabel3": { type: String },
        "customLabel4": { type: String },
        "includedDestinations": [
            { type: String }
        ],
        "excludedDestinations": [
            { type: String }
        ],
        // "customAttributes": [
        //     {
        //         "name": { type: String},
        //         "value": { type: String},
        //         "groupValues": [
        //         ]
        //     }
        // ]
    },
    status: { type: String, default: "N/A" },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Products', productSchema);
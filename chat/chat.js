
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const productModel = require('./../models/productModel');
const discountModel = require('./../models/discountModel');
const shopifyReuest = require('./../helpers/shopifyReuest.js');



const status = {
    greeting: 'pending',
    about_product: 'pending',
    bargaining_start: 'pending',
    bargaining_in_progress: 'pending',
    bulk_order_bargaining: 'pending',
    agreed_on_discount: 'pending',
    coupon: 'pending',
    thank_you: 'pending',
    bye: 'pending'
}

const intents = [
    {
        value: 'Default Welcome Intent',
        replay: 'default',
        status: 'greeting'
    },
    {
        value: 'greeting',
        replay: 'default',
        status: 'greeting'
    },
    {
        value: 'HowAreYou',
        replay: 'default',
        status: 'greeting'
    },
    {
        value: 'IAmGood',
        replay: 'default',
        status: 'greeting'
    },
    {
        value: 'ILikeYou',
        replay: 'default',
        status: 'greeting'
    },
    {
        value: 'nothing',
        replay: 'default',
        status: 'greeting'
    },
    {
        value: 'WhatDoYouDo',
        replay: 'default',
        status: 'greeting'
    },
    {
        value: 'productDetail',
        replay: 'default',
        status: 'about_product'
    },
    {
        value: 'expectingPrice',
        replay: 'dynamic',
        status: 'bargaining_start',
        message: [
            "For such a lovely customer as you, I can offer you %d discount"
        ]
    },
    {
        value: 'IWantDiscount',
        replay: 'dynamic',
        status: 'bargaining_start',
        message: [
            "While I can't offer you that much discount, I can surely work out a %d discount.",
            "Well for the lovely customer that is you, I would love to provide you the %d discount",
            "I can offer you a discount of %d"
        ]
    },
    {
        value: 'iWantToBuy',
        replay: 'default',
        status: 'bargaining_start',
        message: [
            "That's fabulous! I must say you have a great choice."
        ]
    },
    {
        value: 'makeOffer',
        replay: 'dynamic',
        status: 'bargaining_start',
        message: [
            "I can offer you a discount of %d.",
        ]
    },
    {
        value: 'regularCustomer',
        replay: 'dynamic',
        status: 'bargaining_start',
        message: [
            "It's an delight to serve  a regular customer such as you. However I can’t go beyond a discount of %d.",
        ]
    },
    {
        value: 'beforeGotMoreDiscount',
        status: 'bargaining_start',
        message: [
            "The offer gets changed regularly",
            "We provide different offers during the whole year"
        ],
        replay: 'default'
    },
    {
        value: 'increaseDiscount',
        replay: 'dynamic',
        status: 'bargaining_in_progress',
        message: [
            'Considering the fact that the product is of great quality, %d is the maximum discount that I can offer',
            'The maximum that I can give you would be a %d discount.'
        ]
    },
    {
        value: 'lowerPriceFromAnotherWebsite',
        replay: 'default',
        status: 'bargaining_in_progress',
    },
    {
        value: 'BulkOrder',
        replay: 'dynamic',
        status: 'bulk_order_bargaining',

    }, {
        value: 'AgreedOnDiscount',
        replay: 'discount',
        status: 'agreed_on_discount',
        message: [
            'Wonderful! Shall I proceed with the %d discount? Please state "YES" to move ahead.',
        ]
    },
    {
        value: 'proceedDiscount',
        replay: 'discount',
        status: 'coupon',
        message: [
            'Wonderful! Shall I proceed with the %d discount? Please state "YES" to move ahead.',
        ]
    },
    {
        value: 'ILikeYourServices',
        status: 'thank_you',
        replay: 'default'
    },
    {
        value: 'Bye',
        status: 'bye',
        replay: 'default'
    },
    {
        value: 'Default Fallback Intent',
        replay: 'default'
    }
]


module.exports.process = (client) => {
    let timeout;
    client.on('join', (data) => {
        console.log("cliensg getting connect")
    });

    client.on('frontend-message', async (message) => {
        console.log(message);
        clearTimeout(timeout);
        let replay = await this.sendTextMessageToDialogFlow(message);
        client.emit('backend-message', replay);
    });

    client.on('generateCoupon-message', async (message) => {
        let replay = await this.generateCoupon(message);
        console.log(replay);
        client.emit('backend-message', replay);
    });

    client.on('productId-message', async (message) => {
        console.log(message);
        let product = await this.checkBargaining(message)
        client.emit('product-eligible', product.productEligible);
        console.log(product);

        if (product.productEligible) {
            var replay = await this.firstMessage(product.productInfo);
            timeout = setTimeout(() => {
                client.emit('backend-message', replay);
            }, 20000);
        }
    });
}

module.exports.runSample = async () => {

}

module.exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


let firstNumber = [
    {
        maxValue: 10,
        range: {
            max: 2,
            min: 1
        },
        count: {
            max: 2,
            min: 1
        }
    },
    {
        maxValue: 20,
        range: {
            max: 4,
            min: 1
        },
        count: {
            max: 3,
            min: 2
        }
    },
    {
        maxValue: 30,
        range: {
            max: 5,
            min: 1
        },
        count: {
            max: 4,
            min: 2
        }
    },
    {
        maxValue: 40,
        range: {
            max: 7,
            min: 1
        },
        count: {
            max: 5,
            min: 3
        }
    },
    {
        maxValue: 50,
        range: {
            max: 9,
            min: 1
        },
        count: {
            max: 5,
            min: 3
        }
    }
];


let nextDiscountLogic = [
    {
        maxValue: 5,
        range: {
            max: 2,
            min: 1
        }
    },
    {
        maxValue: 10,
        range: {
            max: 3,
            min: 1
        }
    },
    {
        maxValue: 20,
        range: {
            max: 4,
            min: 2
        }
    },
    {
        maxValue: 30,
        range: {
            max: 5,
            min: 2
        }
    },
    {
        maxValue: 40,
        range: {
            max: 5,
            min: 3
        }
    },
    {
        maxValue: 50,
        range: {
            max: 6,
            min: 3
        }
    }
]

module.exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



module.exports.generateNextDiscount = (lastDiscount) => {
    console.log(lastDiscount);
    if (lastDiscount > 50)
        lastDiscount = 50
    var matchCondition = nextDiscountLogic.filter((logic) => {
        return logic.maxValue >= lastDiscount
    });
    console.log(matchCondition[0])
    if (matchCondition[0])
        return this.getRandomInt(matchCondition[0].range.min, matchCondition[0].range.max);
    else
        return undefined
}



module.exports.generateFirstNumber = (maxValue) => {
    if (maxValue > 50)
        maxValue = 50
    var matchCondition = firstNumber.filter((logic) => {
        return logic.maxValue >= maxValue
    });

    if (matchCondition[0])
        return this.getRandomInt(matchCondition[0].range.min, matchCondition[0].range.max);
    else
        return undefined
}

module.exports.generateMaxBargainingCount = (maxValue) => {
    if (maxValue > 50)
        maxValue = 50
    var matchCondition = firstNumber.filter((logic) => {
        return logic.maxValue >= maxValue
    });

    if (matchCondition[0])
        return this.getRandomInt(matchCondition[0].count.min, matchCondition[0].count.max);
    else
        return undefined
}


module.exports.defultResponse = async (response, textMessage, intent) => {
    return {
        message: response[0].queryResult.fulfillmentText,
        maxBargainingCount: textMessage.maxBargainingCount,
        count: textMessage.count,
        lastOffer: textMessage.lastOffer
    };
}


module.exports.getOffredDiscount = (productInfo, textMessage, maxNumber) => {
    let offredDiscount = 0;
    if (productInfo) {
        if (!textMessage.lastOffer) {
            offredDiscount = this.generateFirstNumber(maxNumber);
            lastOffer = offredDiscount
        } else {
            if (textMessage.maxBargainingCount > textMessage.count) {
                var diff = maxNumber - textMessage.lastOffer;
                var nextDiscount = this.generateNextDiscount(diff);
                offredDiscount = nextDiscount + textMessage.lastOffer
            } else {
                offredDiscount = textMessage.lastOffer
            }
        }
        offredDiscount = offredDiscount > maxNumber ? maxNumber : offredDiscount;
    }
    return offredDiscount;
}

module.exports.dynamicResponse = async (responses, textMessage, intent) => {

    let productInfo = await productModel.findOne({ productId: textMessage.productId, deleted: false }).lean().exec();
    let maxNumber = productInfo.discountValue;
    var maxBargainingCount = textMessage.maxBargainingCount ? textMessage.maxBargainingCount : this.generateMaxBargainingCount(maxNumber);

    if (responses[0].queryResult.parameters.fields.percentage) {
        var number = parseInt(responses[0].queryResult.parameters.fields.percentage.stringValue.replace(/\%|,/g, ''));
        maxNumber = productInfo.discountValue > number ? number : productInfo.discountValue;
    }

    let offredDiscount = this.getOffredDiscount(productInfo, textMessage, maxNumber);

    return {
        message: intent.message[this.getRandomInt(0, intent.message.length - 1)].replace(/%d/g, ($0) => {
            return offredDiscount
        }),
        maxBargainingCount: maxBargainingCount,
        lastOffer: offredDiscount,
        count: textMessage.count + 1
    };
}


module.exports.discountResponse = async (responses, textMessage, intent) => {
    return {
        message: intent.message[this.getRandomInt(0, intent.message.length - 1)].replace(/%d/g, ($0) => {
            return textMessage.lastOffer
        }),
        maxBargainingCount: textMessage.maxBargainingCount,
        count: textMessage.count,
        lastOffer: textMessage.lastOffer,
        coupon: true
    };
}



module.exports.sendTextMessageToDialogFlow = async (textMessage) => {
    this.projectId = "bargain-bot"
    let privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCZePn7P1/wCtDN\nwY4O+5QUxW1HjmWnvcftAcjFgPe2R92x8VNK9V/HNRJdqKeAgqY33prIagKh746w\nOHExaXjMUHJtdiLcEuJEV1PptOT9Ml1altdEkdnva2H9l+o42uMx5X+CSAreY88A\n48UjDZfc/ZGIhzcYUlVewn5MSx+324uKmVP40W2KVS6pdvqS4wP+mEAUVMWbPz8x\nkJWwKrDmoHcfPj4O+YID/zcsqTgpv/uW45qEz1a8ON5ts2HyQaKfcwPIfO72EYSA\nQUYAs7MT+VkkR1+Ng4BZbVXkcYl6fvQYRRiJk5hMBWV79IsKzLXdwMzMuup/RMQ2\n5FMvHtpfAgMBAAECggEAFA1b8CluzLYaY7/bN/bupADK+fNPhz6t0rg4diHB0TBg\n9YEipmPFW18CTXgd8UBgx7eklp9PRRQ/8E4M8Bf9Sgi6zWAxnCU1fhjA5INs+0Nr\nh3diR1nH1Vc89ZLgmK7KH44CU9CQ5voNz7/IKqp510x5iZKihAwsjlXa2vdifLWV\nShRTh1Slv4m21XkOOAMUngAfg3JmYTBZ4jFDoLKox/UUwE+iphBJCsmfRrJmU1oA\n0B8tbd9dor5P8mMySBoM1Z6BK4gOBgMBofWvqKvYZbGaavXuegaokKNsWJrKAYRF\n+gjOm1nsi4PYqK73XOZdfcS8Z2Iq6LwOVbsgtkNnDQKBgQDXGJfM/7T9xzS9uEaZ\nb8wMkzcTwXCI1Br1jgQj4+4xRa9UGvK7sjlIYQAhZw1vKSlthgDbDmH+DiprWrit\nzMWB/kbLc7I77FR1Suh0HOeQ9kDRJLRK8H6ISutHu8eFqIKCwsKA/LQ6a4fe5iat\n/p+prxB3kLKltxdBuQI+ABvI0wKBgQC2qGZCwRRaJr+a06T5webWx6S218PKL7ac\nEU4EB0YL0g5oye9jjs4Iw3MFt8QgAkweChwEtOwXzk++OnQb4kRtS2JW2sgmyndi\nzOiPNaoMjfFfE/BLj0ch7EvxXhciZn6MUk19x5VpFcJq1xb24JW2yeAgpxcNxSJk\nHj1p6ftwxQKBgAZ/m7Z500IHjrRcqOVh10xZ9kQGiBvaLKZWkBF1hXC/pjhoSAUb\nsVdaduKLdoBxQespLUVw/czrKKTtrL6zfRQcVo83A5+D2Fli1fsMFILwrayj6z6I\nXYpImSslpTWIjcjdkXrMJ7XMIeK+GVUQaEp8G4dBO+R9z5oQuNyerDg5AoGAIw8R\nibCLmn4jerEy0ilwiDsLl3i0gMNFtpDvu4A15qDr2RshUqefTjlNg4RxJX+rYnyo\nQhMD2dHkpmuLy6pTXfMBLhCSKDfmUFVqMcqoF/7KnGg0UBxxF8bGEM7xe83WblKB\nwymiuOfPSDh+lOYodkwrM7k+iIsU/ch8Gy8o7s0CgYBgjVOdRZsnfaB7s3/Y84ij\nAOXERWXj6Da3fG+/tSAEYv+spEFOBesmgjGizh0INSah5KR6bpehht6qIHmNsJqZ\nNmiuC4Ppt27mVpy0hOdZ1QdFem9TdEfG4YHdWYkMGwCEoNS2osZv0BksIq/0hg+F\nz+XCydIpylFp2pAJcRqsrA==\n-----END PRIVATE KEY-----\n"
    let clientEmail = "bargain-bot@appspot.gserviceaccount.com"
    let config = {
        credentials: {
            private_key: privateKey,
            client_email: clientEmail
        }
    }

    this.sessionClient = new dialogflow.SessionsClient(config);
    const sessionId = uuid.v4();

    // Define session path
    const sessionPath = this.sessionClient.sessionPath(this.projectId, sessionId);
    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: textMessage.message,
                languageCode: 'en-US'
            }
        }
    }

    try {
        let responses = await this.sessionClient.detectIntent(request);
        console.log(responses[0].queryResult.intent.displayName);
        var messageIntent = intents.filter((intent) => {
            return intent.value.toLowerCase() === responses[0].queryResult.intent.displayName.toLowerCase();
        });

        if (messageIntent && messageIntent[0].replay == 'dynamic') {
            return this.dynamicResponse(responses, textMessage, messageIntent[0]);
        } else if (messageIntent && messageIntent[0].replay == 'discount') {
            return this.discountResponse(responses, textMessage, messageIntent[0]);
        } else {
            return this.defultResponse(responses, textMessage, messageIntent[0]);
        }
    }

    catch (err) {
        console.error('DialogFlow.sendTextMessageToDialogFlow ERROR:', err);
        throw err
    }
}

module.exports.generateCoupon = async (message) => {
    console.log(message);
    let productInfo = await productModel.findOne({ productId: message.productId, deleted: false }).populate('userId').lean().exec();
    let discountCount = await discountModel.count({ shopeUrl: productInfo.shopeUrl, deleted: false }) + 1;
    let replay ={}
    console.log(productInfo, discountCount);
    var ends_at = new Date();
    ends_at.setDate(ends_at.getDate() + 1);
    let coupen = 'BR' + productInfo.shopeUrl.substring(0,2).toUpperCase() + discountCount;
    console.log(coupen);

    let price_rule = {
        "price_rule": {
            "title": "Gernrated By Bargie - "+coupen,
            "target_type": "line_item",
            "target_selection": "entitled",
            "allocation_method": "across",
            "value_type": "percentage",
            "value": -message.lastOffer,
            "usage_limit": 1,
            "customer_selection": "all",
            "entitled_product_ids": [
                message.productId
            ],
            "starts_at": new Date().toISOString(),
            "ends_at": ends_at.toISOString()
        }
    }
    let discount_code = {
        discount_code: {
            "code": coupen
        }
    }

    console.log(price_rule);
    await shopifyReuest.post('https://' + productInfo.shopeUrl + '/admin/price_rules.json', productInfo.userId.accessToken, price_rule).then(async (response) => {
        console.log(response.body);
        price_rule = response.body;
        console.log(response.body.price_rule.id);
        await shopifyReuest.post('https://' + productInfo.shopeUrl + '/admin/price_rules/' + response.body.price_rule.id + '/discount_codes.json', productInfo.userId.accessToken, discount_code).then(async (response) => {
            console.log(response.body);
            let data = {
                productId: productInfo._id,
                discountValue: message.lastOffer,
                discountType:"percentage",
                price_rule_id:  response.body.discount_code.price_rule_id,
                discount_code: response.body.discount_code.code,
                discount_code_id: response.body.discount_code.id,
                shopeUrl: productInfo.shopeUrl
            }
            const discount = new discountModel(data);
            const discountSave = await discount.save();
            replay =  {
                message: "Here is your coupen " + discountSave.discount_code+" for "+ discountSave.discountValue +"% and coupe expire in one day",
                maxBargainingCount: message.maxBargainingCount,
                count: message.count,
                lastOffer: discountSave.discountValue
            };
        });
    });

    return replay;
    // https://dev-srore.myshopify.com/admin/price_rules.json
    //    {
    // "price_rule": {
    //   "title": "15OFFCOLLECTION",
    //   "target_type": "line_item",
    //   "target_selection": "entitled",
    //   "allocation_method": "across",
    //   "value_type": "percentage",
    //   "value": "-15.0",
    //   "usage_limit": 1,
    //   "customer_selection": "all",
    //   "entitled_product_ids": [
    //     9169694276
    //   ],
    //   "starts_at": "2017-01-19T17:59:10Z",
    //   "ends_at":"2017-01-20T17:59:10Z"
    // }
    //   }

    //https://dev-srore.myshopify.com/admin/price_rules/343720460339/discount_codes.json
    // {
    //     "discount_code": {
    //       "code": "15OFFCOLLECTION"
    //     }
    //   }

}


module.exports.checkBargaining = async (message) => {
    let productInfo = await productModel.findOne({ productId: message.productId, deleted: false }).lean().exec();
    if (productInfo) {
        return {
            productInfo: productInfo,
            productEligible: true
        }
    } else {
        return {
            productEligible: false
        }
    }
}

module.exports.firstMessage = async (product) => {
    var offredDiscount = this.generateFirstNumber(product.discountValue);
    var maxBargainingCount = this.generateMaxBargainingCount(product.discountValue);
    return {
        message: 'offred discount ' + offredDiscount,
        maxBargainingCount: maxBargainingCount,
        count: 0,
        lastOffer: offredDiscount
    };
}
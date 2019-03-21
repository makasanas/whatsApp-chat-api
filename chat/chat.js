
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const productModel = require('./../models/productModel');


// module.exports.runSample = async (message, projectId = 'bargain-bot') => {

//     console.log(message);
//     /**
//      * Send a query to the dialogflow agent, and return the query result.
//      * @param {string} projectId The project to be used
//      */
//     // A unique identifier for the given session
//     const sessionId = uuid.v4();

//     // Create a new session
//     const sessionClient = new dialogflow.SessionsClient();
//     const sessionPath = sessionClient.sessionPath(projectId, sessionId);

//     // The text query request.
//     const request = {
//         session: sessionPath,
//         queryInput: {
//             text: {
//                 text: 'hello',
//                 languageCode: 'en-US',
//             },
//         },
//     };

//     // Send request and log result
//     const responses = await sessionClient.detectIntent(request);
//     console.log('Detected intent');
//     const result = responses[0].queryResult;
//     console.log(`  Query: ${result.queryText}`);
//     console.log(`  Response: ${result.fulfillmentText}`);
//     if (result.intent) {
//         console.log(`  Intent: ${result.intent.displayName}`);
//     } else {
//         console.log(`  No intent matched.`);
//     }
// }



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

    client.on('productId-message', async (message) => {
        console.log(message);
        let product = await this.checkBargaining(message)
        client.emit('product-eligible', product.productEligible);
        console.log(product);

        if(product.productEligible){
          var replay = await  this.firstMessage(product.productInfo);
        var date1 = new Date("7/13/2010");

          timeout =  setTimeout(() => {
            var date2 = new Date("12/15/2010");
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            console.log(timeDiff);
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
        count:{
            max:2,
            min:1
        }
    },
    {
        maxValue: 20,
        range: {
            max: 4,
            min: 1
        },
        count:{
            max:3,
            min:2
        }
    },
    {
        maxValue: 30,
        range: {
            max: 5,
            min: 1
        },
        count:{
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
        count:{
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
        count:{
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
        console.log(responses[0].queryResult.parameters);
        console.log(responses[0].queryResult.intent.displayName);
        var number = parseInt(responses[0].queryResult.parameters.fields.percentage1.stringValue.replace(/\%|,/g, ''))
        let productInfo = await productModel.findOne({ productId:textMessage.productId, deleted:false }).lean().exec();
        let maxNumber = productInfo.discountValue > number ? number : productInfo.discountValue;
        var maxBargainingCount =  textMessage.maxBargainingCount? textMessage.maxBargainingCount : this.generateMaxBargainingCount(maxNumber);
        let offredDiscount = 0;
        if(productInfo){
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

            offredDiscount = offredDiscount > maxNumber ? maxNumber : maxNumber;
            return {
                message: 'offred discount ' + offredDiscount,
                maxBargainingCount: maxBargainingCount,
                lastOffer: offredDiscount,
                count: textMessage.count
            };
        }

        
       
    }
    catch (err) {
        console.error('DialogFlow.sendTextMessageToDialogFlow ERROR:', err);
        throw err
    }
}

module.exports.checkBargaining = async (message) => {
    let productInfo = await productModel.findOne({ productId:message.productId, deleted:false }).lean().exec();
    if(productInfo){
        return {
            productInfo: productInfo,
            productEligible: true
        }
    }else{
        return {
            productEligible: false
        }
    }
}

module.exports.firstMessage = async (product) => {
    var offredDiscount = this.generateFirstNumber(product.discountValue);
    var maxBargainingCount =  this.generateMaxBargainingCount(product.discountValue);
    return {
        message: 'offred discount ' + offredDiscount ,
        maxBargainingCount: maxBargainingCount,
        count: 0,
        lastOffer: offredDiscount
    };
}
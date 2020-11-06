/*
FileName : dbConnection.js
Date : 2nd Aug 2018
Description : This file consist of code for MongoDB connection
*/

var mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// database connection
mongoose.connect('mongodb://127.0.0.1:27017/starterKitDb', { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 10, auto_reconnect: true });

// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to mongodb://127.0.0.1:27017/starterKitDb');
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
  mongoose.disconnect();
});


// var mongoose = require('mongoose');
// var tunnel = require('tunnel-ssh');

// var config = {
//   username:'root',
// 	password:'KingKong@99747',
// 	host: '198.199.90.15',
// 	dstHost: '127.0.0.1',
// 	port: 22,
// 	localPort: 27017,
// 	dstPort: 27017,
// 	localHost: '127.0.0.1'
// };

// var server = tunnel(config, function (error, server) {
//   if(error){
//       console.log("SSH connection error: " + error);
//   }

//   console.log(server);
//   // mongoose.connect(process.env['MONGO_URL'], { useNewUrlParser: true, poolSize: 10, auto_reconnect: true });

//   mongoose.connect('mongodb://127.0.0.1:27017/googleShoppingFeedDBProd', { useNewUrlParser: true, poolSize: 10, auto_reconnect: true });

//   var db = mongoose.connection;
//   db.on('error', console.error.bind(console, 'DB connection error:'));
//   db.once('open', function() {
//       // we're connected!
//       console.log("DB connection successful");
//   });
// });


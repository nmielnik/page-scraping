'use strict';

var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));

var Transactions = require("./data/transactionsJSON.js");

var year = argMap.year || 2015;
if (!year || isNaN(year) || year < 2006 || year > new Date().getFullYear()) {
	console.error('year: ' + argMap.year + ' is invalid');
	return;
}
var season = year - 2006;
if (year > 2020)
	season--;
var inputFileName = `${year}-Transactions1.json`;
var playersFileName = `${year}-Transactions-Playerlist.json`

if (!argMap.numFiles)
	console.error('numFiles: ' + argMap.numFiles + ' is invalid');
var numFiles = argMap.numFiles;

if (!argMap.outputFile) {
	console.error('outputFile: ' + argMap.outputFile + ' is invalid');
	return;
}
var outputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/BallersXML', argMap.outputFile);

var inputFiles = [];
for (var i = 1; i <= numFiles; i++) {
	inputFiles.push(require(path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/JSON', `${year}-Transactions${i}.json`)));
}
var playerFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/JSON', playersFileName);
var playerJSON = require(playerFile);

var transactions = Transactions.parseTransactions(year, inputFiles, playerJSON);

fs.writeFileAsync(outputFile, transactions.toXML()).then(function () {
	console.log('Saved to: ' + outputFile);
}).catch(function (error) {
	console.error(error, error.stack);
});

/*
Parser.parseFile({
	filePath: filePath
}).then(function (data) {
	var transactions = Transactions.parseTransactions(year, data.body);

	fs.writeFileAsync(outputFile, transactions.toXML()).then(function () {
		console.log('Saved to: ' + outputFile);
	}).catch(function (error) {
		console.error(error, error.stack);
	})
}).catch(function (error) {
	console.error(error, error.stack);
});*/
var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));

var Parser = require("../parser");
var Transactions = require("./data/transactions.js");


var year = argMap.year || 2015;
if (!year || isNaN(year) || year < 2006 || year > new Date().getFullYear()) {
	console.error('year: ' + argMap.year + ' is invalid');
	return;
}

if (!argMap.outputFile) {
	console.error('outputFile: ' + argMap.outputFile + ' is invalid');
	return;
}
var outputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/BallersXML', argMap.outputFile);

var srcDir = '//EINSTEIN/Web/BallersUnite/RawHTML';
var srcFileFormat = '{year}Transactions.htm';
var filePath = path.join(srcDir, srcFileFormat.replace('{year}', year));
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
});
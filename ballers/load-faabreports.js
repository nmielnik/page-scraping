var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));
var glob = require("glob");

var Parser = require("../parser");
var FAABReport = require("./data/faabReport");

var srcDir = '//EINSTEIN/Web/BallersUnite/RawHTML';
var promises = [];

fs.readdir(srcDir, function (er, files) {
	files.forEach(function (filename) {
		if (filename.indexOf('FAAB-') === 0) {
			promises.push(Parser.parseFile({
				filePath: srcDir + '/' + filename
			}));
		}
	});

	Promise.all(promises).spread(function () {
		var allBids = [];
		Array.prototype.slice.apply(arguments).forEach(function (data) {
			allBids = allBids.concat(FAABReport.parseBids(data.body));
		});

		FAABReport.sortByCost(allBids);
	});
});
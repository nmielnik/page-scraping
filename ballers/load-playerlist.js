'use strict';

var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var moment = require("moment");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));

var Parser = require("../parser");
var PlayerList = require("./data/playerList");


var year = 0;
if (!argMap.year || isNaN(year = parseInt(argMap.year)) || year < 2006 || year > new Date().getFullYear()) {
	console.error(`year: ${argMap.year} is invalid`);
	return;
}
var uriFormat = `http://games.espn.go.com/ffl/tools/projections?&leagueId=403286&seasonId=${year}`;

var lastIndex = 0;
if (!argMap.lastIndex || isNaN(lastIndex = parseInt(argMap.lastIndex)) || lastIndex < 0 || lastIndex > 3000) {
	console.error(`lastIndex: ${argMap.lastIndex} is invalid`);
	return;
}

if (!argMap.outputFile) {
	console.error(`outputFile: ${argMap.outputFile} is invalid`);
	return;
}

var saveDir = '//EINSTEIN/Web/BallersUnite/RawHTML/Players';
var promises = [];
for (var index = 0; index <= lastIndex; index += 40) {
	var uri = uriFormat;
	if (index > 0) {
		uri += '&startIndex=' + index;
	}

	var id = index / 40;
	id = (id < 10) ? ('0' + id) : ('' + id);
	
	var fileName = `${year}Players-(${moment().format('MM-DD-YY')})-${id}.htm`;

	promises.push(Parser.parseUrl({
		saveToFile: path.join(saveDir, fileName),
		uri: uri
	}));
}

Promise.all(promises).spread(function () {
	var playerList = new PlayerList();
	Array.prototype.slice.apply(arguments).forEach(function (data) {
		playerList.addPlayersFromHTML(data.body);
	});
	fs.writeFileAsync(argMap.outputFile, playerList.toXML()).then(function () {
		console.log(`Saved to: ${argMap.outputFile}`);
	}).catch(function (error) {
		console.error(error, error.stack);
	});
}).catch(function (error) {
	console.error(error, error.stack);
});
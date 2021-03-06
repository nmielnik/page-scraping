var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));

var Parser = require("../parser");
var BoxScore = require("./data/boxscore.js").BoxScore;
var ScoringSummary = require("./data/scoring-summary.js");

var year = argMap.year || 2016;
if (!year || isNaN(year) || year < 2006 || year > new Date().getFullYear()) {
	console.error('year: ' + argMap.year + ' is invalid');
	return;
}

var week = argMap.week;
if (!week) {
	console.error('week: ' + argMap.week + ' is invalid');
	return;
}

if (!argMap.games) {
	console.error('games: ' + argMap.games + ' is invalid');
	return;
}
var games = argMap.games.split(';');

if (!argMap.outputFile) {
	console.error('outputFile: ' + argMap.outputFile + ' is invalid');
	return;
}
var outputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/BallersXML', argMap.outputFile);

var srcDir = '//EINSTEIN/Web/BallersUnite/RawHTML';
var promises = [];
games.forEach(function (game) {
	var fileName = `FullBoxScore-${year}-Week${week}-${game}.htm`;
	var otherFileName = `FullBoxScore-${year}-Week${week}-Scoring-${game}.htm`;

	promises.push(Promise.all([
			Parser.parseFile({ filePath: path.join(srcDir, fileName) }),
			Parser.parseFile({ filePath: path.join(srcDir, otherFileName) })
		])
		.then(function (res) {
			return {
				boxScoreBody: res[0].body,
				scoringBody: res[1].body
			};
		})
	);
});

Promise.all(promises).spread(function () {
	var parts = ['<LeagueResults year="' + year + '">'];
	Array.prototype.slice.apply(arguments).forEach(function (data) {
		var scoring = ScoringSummary.parseScoringSummary(data.scoringBody);
		var lineup = BoxScore.parseBoxScore(data.boxScoreBody, scoring);
		console.log('------------------------------');
		console.log(lineup.getGameDescription());
    	console.log(lineup.toSummaryString());
    	parts.push(lineup);
    	if (lineup.oppLineup) {
    		parts.push(lineup.oppLineup);
    	}
	});
	parts.push('</LeagueResults>');
	fs.writeFileAsync(outputFile, parts.join('\r\n')).then(function () {
		console.log('Saved to: ' + outputFile);
	}).catch(function (error) {
		console.error(error, error.stack);
	});
}).catch(function (error) {
	console.error(error, error.stack);
});
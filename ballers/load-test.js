var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));

var Parser = require("../parser");
var BoxScore = require("./data/boxscore.js");
var ScoringSummary = require("./data/scoring-summary.js");

var year = 2017;
var week = 1;
var games = ['01@12', '03@05', '06@02', '08@07', '09@04', '10@11'];
var outputFile = 'temp.xml';
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
			console.log(`res is length ${res.length}`);
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
		// var lineup = BoxScore.parseBoxScore(data.boxScoreBody);
		var scoring = ScoringSummary.parseScoringSummary(data.scoringBody);
		console.log('------------------------------');
		console.log(scoring.getGameDescription());
		console.log(scoring.toSummaryString());
		parts.push(scoring);
		if (scoring.oppLineup) {
			parts.push(scoring.oppLineup);
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
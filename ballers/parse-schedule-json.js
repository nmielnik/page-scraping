// https://fantasy.espn.com/apis/v3/games/ffl/seasons/2019/segments/0/leagues/403286?view=mMatchupScore&view=mStatus&view=mSettings&view=mTeam&view=modular&view=mNav

var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));

var year = argMap.year || 2016;
if (!year || isNaN(year) || year < 2006 || year > new Date().getFullYear()) {
	console.error('year: ' + argMap.year + ' is invalid');
	return;
}
var season = year - 2006;
if (year > 2020)
	season--;
var inputFileName = `espn-Ballers-${year}.json`;

if (!argMap.outputFile) {
	console.error('outputFile: ' + argMap.outputFile + ' is invalid');
	return;
}
var outputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/JSON', argMap.outputFile);

var inputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/JSON', inputFileName);

var espnJSON = require(inputFile);

var seasonGames = {
	season: season,
	year: year,
	weeks: {}
};
var fullSchedule = seasonGames.weeks;
var teamNames = {};

var addToSchedule = function (game) {
	if (!fullSchedule[game.week]) {
		fullSchedule[game.week] = {
			week: game.week,
			games: []
		};
	}
	fullSchedule[game.week].games.push(game);
}

espnJSON.schedule.forEach(function (currMatch) {
	addToSchedule({
		year: year,
		season: season,
		week: currMatch.matchupPeriodId,
		homeTeam: currMatch.home.teamId,
		awayTeam: currMatch.away.teamId
	});
});

Object.keys(fullSchedule).forEach(function(week) {
	var missingTeams = [];
	for (var i = 1; i < 13; i++)
		missingTeams.push(i);
	fullSchedule[week].games.forEach(function(game) {
		var homeIndex = missingTeams.indexOf(game.homeTeam);
		if (homeIndex !== -1) {
			missingTeams.splice(homeIndex,1);
		}
		var awayIndex = missingTeams.indexOf(game.awayTeam);
		if (awayIndex !== -1) {
			missingTeams.splice(awayIndex,1);
		}
	});
	if (missingTeams.length) {
		var missingTeamStr = missingTeams.join(', ');
		console.error(`Week ${week}: ${fullSchedule[week].games.length} games | Missing Teams: ${missingTeamStr}`);
		process.exit();
	}
});

fs.writeFileAsync(outputFile, JSON.stringify(seasonGames))
	.then(function () {
		console.log(`Saved to ${outputFile}`);
	})
	.catch(function (err) {
		console.log(err);
	});
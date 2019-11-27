// https://fantasy.espn.com/apis/v3/games/ffl/seasons/2019?view=proTeamSchedules_wl

var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));
var moment = require("moment");

var year = argMap.year || 2016;
if (!year || isNaN(year) || year < 2006 || year > new Date().getFullYear()) {
	console.error('year: ' + argMap.year + ' is invalid');
	return;
}
var season = year - 2006;
var inputFileName = `espn-NFLSchedule-${year}.json`;

if (!argMap.outputFile) {
	console.error('outputFile: ' + argMap.outputFile + ' is invalid');
	return;
}
var outputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/JSON', argMap.outputFile);

var ESPNIDtoBallersID = {
	"0": 34,
	"1": 25,
	"2": 2,
	"3": 24,
	"4": 6,
	"5": 5,
	"6": 19,
	"7": 15,
	"8": 21,
	"9": 23,
	"10": 11,
	"11": 12,
	"12": 14,
	"13": 16,
	"14": 31,
	"15": 1,
	"16": 22,
	"17": 3,
	"18": 27,
	"19": 18,
	"20": 4,
	"21": 17,
	"22": 30,
	"23": 8,
	"24": 13,
	"25": 32,
	"26": 29,
	"27": 28,
	"28": 20,
	"29": 26,
	"30": 9,
	"33": 7,
	"34": 10
};


var inputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/JSON', inputFileName);

var espnJSON = require(inputFile);

var seasonGames = {
	year: year,
	season: season,
	weeks: {}
};

var fullSchedule = seasonGames.weeks;
var teamNames = {};

var addToSchedule = function (game) {
	if (!fullSchedule[game.week]) {
		fullSchedule[game.week] = {
			year: year,
			season: season,
			week: game.week,
			games: []
		};
	}
	fullSchedule[game.week].games.push(game);
}

var detectTimeType = function(date) {
	if (date.day() === 1) { // Monday
		if (date.hour() >= 22) {
			return 11;
		}
		return 10;
	} else if (date.day() === 4) { // Thursday
		if (date.hour() >= 19) {
			return 3;
		} else if (date.hour() >= 14) {
			return 2;
		}
		return 1;
	} else if (date.day() === 6) { // Saturday
		if (date.hour() >= 20) {
			return 6;
		} else if (date.hour() >= 15) {
			return 5;
		}
		return 4;
	} else if (date.day() !== 0) {
		console.error(`Invalid day of week: ${date.toString()}`);
		return -1;
	} else { // Sunday
		if (date.hour() >= 18) {
			return 9;
		} else if (date.hour() >= 15) {
			return 8;
		} else if (date.hour() <= 11) {
			return 15;
		}
		return 7;
	}
}

espnJSON.settings.proTeams.forEach(function (currTeam) {
	if (currTeam.proGamesByScoringPeriod) {
		if (!teamNames[currTeam.id]) {
			teamNames[currTeam.id] = currTeam.name;
		}
		for(var period = 1; period <= 17; period++) {
			if (currTeam.proGamesByScoringPeriod[period]) {
				var currGame = currTeam.proGamesByScoringPeriod[period][0];
				if (currGame && currGame.homeProTeamId === currTeam.id) {
					var gameDate = moment(currGame.date);
					var newGame = {
						week: currGame.scoringPeriodId,
						season: season,
						homeTeam: ESPNIDtoBallersID[currGame.homeProTeamId],
						awayTeam: ESPNIDtoBallersID[currGame.awayProTeamId],
						timeType: detectTimeType(gameDate),
						dateStr: gameDate.format('ddd DD/MM/YY'),
						timeStr: gameDate.format('h:mm A')
					}
					addToSchedule(newGame);
				}
			}
		}
	}
});

/* For Testing
Object.keys(fullSchedule).forEach(function(week) {
	var byeWeeks = [];
	Object.keys(teamNames).forEach(function(teamId) {
		byeWeeks.push(parseInt(teamId));
	});
	fullSchedule[week].forEach(function(game) {
		var homeIndex = byeWeeks.indexOf(game.homeTeam);
		if (homeIndex !== -1) {
			byeWeeks.splice(homeIndex,1);
		}
		var awayIndex = byeWeeks.indexOf(game.awayTeam);
		if (awayIndex !== -1) {
			byeWeeks.splice(awayIndex,1);
		}
	});
	var byeTeamStr = "(none)";
	if (byeWeeks.length) {
		var byeNames = [];
		byeWeeks.forEach(function(tmId) {
			byeNames.push(teamNames[tmId]);
		});
		byeTeamStr = byeNames.join(', ');
	}
	console.log(`Week ${week}: ${fullSchedule[week].length} games | Byes: ${byeTeamStr}`);
});
*/

fs.writeFileAsync(outputFile, JSON.stringify(seasonGames))
	.then(function () {
		console.log(`Saved to ${outputFile}`);
	})
	.catch(function (err) {
		console.log(err);
	});
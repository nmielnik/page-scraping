var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));
var playerNames = require('./data/player-name-special-cases');
var fetchTeamWeeks = require("../../fetching/espn-fetch-teamweeks");

var leagueId = 403286;

var year = argMap.year || 2016;
if (!year || isNaN(year) || year < 2006 || year > new Date().getFullYear()) {
	console.error('year: ' + argMap.year + ' is invalid');
	return;
}
var season = year - 2006;
if (year > 2019)
	season -= 1;

var week = argMap.week;
if (!week) {
	console.error('week: ' + argMap.week + ' is invalid');
	return;
}

var teams = [1,2,3,4,5,6,7,8,9,10,11,12];
if (argMap.teams) {
	teams = JSON.parse(argMap.teams);
}

if (!argMap.outputFile) {
	console.error('outputFile: ' + argMap.outputFile + ' is invalid');
	return;
}
var outputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/JSON', argMap.outputFile);


//var inputFileName = `${year}-Rosters-Week${week}.json`;
//var inputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/BallersXML', inputFileName);
//var rawJSON = require(inputFile);

var twoPtFunction = function(allStats) { return (allStats[19] || 0) + (allStats[26] || 0) + (allStats[44] || 0); };
var retTDFunction = function(allStats) { return (allStats[93] || 0) + (allStats[103] || 0) + (allStats[104] || 0); };

var statsToFill = [
	{espnid: -1, id: 1, name: 'Pts'},
	{espnid: -2, id: 13, name: 'TwoPt', fn: twoPtFunction},
	{espnid: -3, id: 16, name: 'RetTD', fn: retTDFunction},
	{espnid: 0, id: 3, name: 'PsAtt'},
	{espnid: 1, id: 2, name: 'PsComp'},
	{espnid: 3, id: 4, name: 'PsYds'},
	{espnid: 4, id: 5, name: 'PsTD'},
	{espnid: 20, id: 6, name: 'PsINT'},
	{espnid: 23, id: 7, name: 'RhAtt'},
	{espnid: 24, id: 8, name: 'RhYds'},
	{espnid: 25, id: 9, name: 'RhTD'},
	{espnid: 42, id: 11, name: 'RcYds'},
	{espnid: 43, id: 12, name: 'RcTDs'},
	{espnid: 53, id: 10, name: 'Rc'},
	{espnid: 68, id: 14, name: 'Fum'},
	{espnid: 72, id: 15, name: 'FumL'},
	{espnid: 101, id: 41, name: 'KRetTD'},
	{espnid: 102, id: 42, name: 'PRetTD'},
	{espnid: 114, id: 39, name: 'KRetYds'},
	{espnid: 115, id: 40, name: 'PRetYds'},
	{espnid: 63, id: 44, name: 'FumRecTD'},
];

var leagueWeek = {
	year: year,
	season: season,
	week: week
};

fetchTeamWeeks.getTeamWeeksJSON(leagueId, year, week, teams)
	.then(function(rawJSON) {
		leagueWeek.rosters = rawJSON.rosters.map(function (currTeam) {
			var team = {
				teamId: currTeam.teamId
			};
			var nextRoster = currTeam.roster.map(function (currSlot) {
				var plyr = currSlot.player;
				var rosterSlot = {
					lineupSlotId: currSlot.lineupSlotId,
					playerId: plyr.id,
					position: plyr.defaultPositionId,
					firstName: plyr.firstName.replace(/'/g, '*'),
					lastName: plyr.lastName.replace(/'/g, '*'),
					fullName: plyr.fullName.replace(/'/g, '*'),
					proTeamId: plyr.proTeamId,
					points: 0,
				};
				if (plyr.stats) {
					rosterSlot.points = plyr.stats.appliedTotal;
				}
				if (playerNames.PlayerNames[rosterSlot.fullName]) {
					var override = playerNames.PlayerNames[rosterSlot.fullName];
					rosterSlot.firstName = override.first;
					rosterSlot.lastName = override.last;
					rosterSlot.suffix = override.suffix;
					rosterSlot.identifier = override.identifier;
					rosterSlot.fullName = playerNames.fullNameFormat(override);
				} else if (rosterSlot.lastName.indexOf(' ') !== -1) {
					var newLast = rosterSlot.lastName.split(' ')[0];
					var newSuffix = rosterSlot.lastName.substr(newLast.length + 1);
					rosterSlot.lastName = newLast;
					rosterSlot.suffix = newSuffix;
				}
				var plyrStats = (plyr.stats && plyr.stats.stats) ? plyr.stats.stats : [];
				rosterSlot.stats = statsToFill.map(function (statInfo) {
					var data = { id: statInfo.id, name: statInfo.name };
					if (statInfo.espnid === -1) {
						data.value = rosterSlot.points;
					} else if (statInfo.fn) {
						data.value = statInfo.fn(plyrStats);
					} else {
						data.value = plyrStats[statInfo.espnid] || 0;
					}
					return data;
				});
				return rosterSlot;
			});
			team.points = nextRoster.reduce(function (total, nextSlot) {
				if (nextSlot.lineupSlotId < 20)
					total += nextSlot.points;
				return total;
			}, 0).toFixed(2);
			team.benchPoints = nextRoster.reduce(function (total, nextSlot) {
				if (nextSlot.lineupSlotId === 20)
					total += nextSlot.points;
				return total;
			}, 0).toFixed(2);
			team.roster = nextRoster;
			return team;
		});

		fs.writeFileAsync(outputFile, JSON.stringify(leagueWeek))
			.then(function () {
				console.log(`Saved to ${outputFile}`);
			})
			.catch(function (err) {
				console.log(err);
			});
	});
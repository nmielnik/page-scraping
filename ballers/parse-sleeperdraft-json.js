// Sleeper.app JSON

var COMMISH_ID = "472860481078423552";

var teamMap = {
	"472860481078423552": 0,
	"472173428724461568": 6,
	"473958668950302720": 3,
	"473967536543625216": 4,
	"474224122742697984": 12,
	"474092708718178304": 5,
	"474047944450895872": 9,
	"473606206078840832": 7,
	"474040061285888000": 2,
	"474011999957676032": 11,
	"473606814156451840": 8,
	"474413292035502080": 10,
	"472241202268205056": 1
};

var orderToTeam = [0, 6, 3, 4, 12, 5, 9, 7, 2, 11, 8, 10, 1];
var teamToOrder = [0, 12, 8, 2, 3, 5, 1, 7, 10, 6, 11, 9, 4];

var manualOverrides = {
	11: {
		4: 12
	},
	14: {
		9: 11,
		10: 8
	}
};

var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));
var moment = require("moment");
var playerNames = require('./data/player-name-special-cases');

var SPECIAL_NAMES = playerNames.PlayerNames;

var year = argMap.year || 2016;
if (!year || isNaN(year) || year < 2006 || year > new Date().getFullYear()) {
	console.error('year: ' + argMap.year + ' is invalid');
	return;
}

if (!argMap.outputFile) {
	console.error('outputFile: ' + argMap.outputFile + ' is invalid');
	return;
}
var outputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/JSON', argMap.outputFile);


var season = year - 2006;
var inputFileName = `sleeper-Draft-${year}.json`;

var inputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/JSON', inputFileName);

// For testing
var keepers = [[], [], [], [], [], [], [], [], [], [], [], [], []];

var rawJSON = require(inputFile);
var maxRound = 0;
var startTime = new Date(rawJSON.data.get_draft.start_time);

var rawPicks = rawJSON.data.draft_picks.map(function (currPick) {
	var pick = {
		pickNumber: currPick.pick_no,
		round: Math.floor((currPick.pick_no - 1) / 12) + 1,
		pick: (currPick.pick_no % 12) || 12
	};
	maxRound = (pick.round > maxRound) ? pick.round : maxRound;

	var plyr = currPick.metadata;
	pick.player = {
		first: plyr.first_name.replace(/'/g, '*'),
		last: plyr.last_name.replace(/'/g, '*'),
		position: plyr.position,
		team: plyr.team
	};
	var pName = `${pick.player.first} ${pick.player.last}`;
	if (SPECIAL_NAMES[pName]) {
		var override = SPECIAL_NAMES[pName];
		console.log(`Mapping ${pName} to ${playerNames.fullNameFormat(override)}`);
		pick.player = Object.assign(pick.player, SPECIAL_NAMES[pName]);
	}
	var picker = teamMap[currPick.picked_by];
	// manual overrides
	if (manualOverrides[pick.round] && manualOverrides[pick.round][pick.pick]) {
		picker = manualOverrides[pick.round][pick.pick];
	}
	var expectedPicker = orderToTeam[pick.pick];
	if (!picker) {
		if (currPick.picked_by === COMMISH_ID) {
			pick.type = 'KEEPER';
			pick.team = expectedPicker;
			keepers[pick.team].push(pick);
		} else {
			pick.type = 'INVALID';
			console.error(`Invalid Picker ${picker} for: \n ${pick}`);
		}
	} else {
		pick.team = picker;
		if (picker !== expectedPicker) {
			pick.type = 'TRADED PICK';
			pick.tradedFrom = expectedPicker;
		} else {
			pick.type = 'NORMAL';
		}
	}
	return pick;
});

var draftInfo = {
	year: year,
	season: season,
	startTime: startTime,
	picks: rawPicks
};

console.log(`${rawPicks.length} total picks for ${maxRound} rounds parsed`);


/* // For Testing
keepers.forEach(function (team, idx) {
	if (idx) {
		console.log(`Team ${idx} Keepers (${team.length})`);
		team.forEach(function (pick) {
			console.log(`${pick.player.first} ${pick.player.last} (Round ${pick.round} Pick ${pick.pick})`);
		});
	}
});
*/

fs.writeFileAsync(outputFile, JSON.stringify(draftInfo))
	.then(function () {
		console.log(`Saved to ${outputFile}`);
	})
	.catch(function (err) {
		console.log(err);
	});
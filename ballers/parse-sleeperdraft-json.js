// Sleeper.app JSON

var COMMISH_ID = "472860481078423552";
var COMMISH_TEAM_ID = 1;

/* 2019 Draft Settings
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

var tradedPicks = {
	11: {
		4: 12
	},
	14: {
		9: 11,
		10: 8
	}
};
*/

/* 2021 Draft Settings
var teamMap = {
	"472860481078423552": 1,
	"472173428724461568": 6,
	"473958668950302720": 3,
	"473967536543625216": 4,
	"474224122742697984": 12,
	"474092708718178304": 5,
	"474047944450895872": 9,
	"738582154770051072": 7,
	"738016950403395584": 2,
	"472241202268205056": 11,
	"738589923208212480": 8,
	"474413292035502080": 10
};

var orderToTeam = [0, 8, 9, 3, 12, 5, 11, 10, 1, 7, 4, 2, 6];
var teamToOrder = [0, 8, 11, 3, 10, 5, 12, 9, 1, 2, 7, 6, 4];

var tradedPicks = {
	2: {
		12: 6
	},
	6: {
		6: 12
	},
	16: {
		5: 5,
		6: 11
	},
	17: {
		4: 4,
		10: 11
	}
};

var commishKeepers = {
	1: { 8: true },
	2: { 8: true },
	12: { 8: true }
};

var commishManualPicks = {
	13: {
		2: 9
	},
	16: {
		2: 9
	}
};
*/

/* 2022 Draft Settings 

var teamMap = {
	"472860481078423552": 1,
	"472173428724461568": 6,
	"473958668950302720": 3,
	"473967536543625216": 4,
	"474224122742697984": 12,
	"474092708718178304": 5,
	"474047944450895872": 9,
	"738582154770051072": 7,
	"738016950403395584": 2,
	"472241202268205056": 11,
	"738589923208212480": 8,
	"872988876044697600": 10
};

var orderToTeam = [0, 5, 1, 6, 8, 4, 3, 12, 9, 7, 11, 2, 10];
var teamToOrder = [0, 2, 11, 6, 5, 1, 3, 9, 4, 8, 12, 10, 7];

// Any traded draft picks
var tradedPicks = {
	3: {
		8: 1
	},
	5: {
		11: 5
	},
	7: {
		2: 12
	},
	8: {
		3: 4
	},
    10: {
    	1: 1
    },
    11: {
    	7: 1
    },
    13: {
    	2: 3
    },
    15: {
    	1: 2
    },
    17: {
    	2: 9,
    	5: 6,
    	6: 5
    }
};

// Round + Pick of the commish's keepers
var commishKeepers = {
	3: { 2: true },
	8: { 2: true },
	12: { 2: true }
};

// Picks Manually selected by commisioner
var commishManualPicks = {
	1: {
		9: 7
	},
	9: {
		3: 6,
		4: 8,
		5: 4,
		6: 3,
		7: 12,
		8: 9
	},
	11: {
		3: 6,
		8: 9
	}
};
*/

var teamMap = {
	"472860481078423552": 1,
	"472173428724461568": 6,
	"473958668950302720": 3,
	"473967536543625216": 4,
	"474224122742697984": 12,
	"474092708718178304": 5,
	"474047944450895872": 9,
	"738582154770051072": 7,
	"738016950403395584": 2,
	"472241202268205056": 11,
	"1000624559290163200": 8,
	"872988876044697600": 10
};

var orderToTeam = [0, 7, 5, 9, 11, 6, 12, 2, 3, 10, 1, 8, 4];
var teamToOrder = [0, 10, 7, 8, 12, 2, 5, 1, 11, 3, 9, 4, 6];

// Any traded draft picks
var tradedPicks = {
	3: {
		7: 9,
		11: 3,
		12: 12
	},
	4: {
		2: 4,
		5: 1,
		6: 4,
		10: 5,
		12: 1
	},
	5: {
		2: 1,
		11: 1
	},
	6: {
		8: 11,
		10: 4
	},
	8: {
		10: 5
	},
	9: {
		6: 4
	},
    10: {
    	10: 6
    },
    16: {
    	12: 12
    },
    17: {
    	2: 1,
    	3: 2,
    	4: 3,
    	8: 8,
    	10: 8,
    	12: 5
    }
};

// Any keepers kept in place of a traded draft pick
var tradedPickKeepers = {
	3: {
		12: true
	}
};

// Round + Pick of the commish's keepers
var commishKeepers = {
	1: { 10: true },
	2: { 10: true },
	3: { 10: true }
};

// Picks Manually selected by commisioner
var commishManualPicks = {
	4: {
		2: 4
	},
	4: {
		12: 1
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
if (year > 2020)
	season--;
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

	var expectedPicker = orderToTeam[pick.pick];
	var picker = teamMap[currPick.picked_by];
	// manual overrides
	if (tradedPicks[pick.round] && tradedPicks[pick.round][pick.pick]) {
		picker = tradedPicks[pick.round][pick.pick];
		pick.team = picker;
		if (tradedPickKeepers[pick.round] && tradedPickKeepers[pick.round][pick.pick])
			pick.type = 'KEEPER';
		else
			pick.type = 'TRADE PICK';
		pick.tradedFrom = expectedPicker;
	} else if (currPick.picked_by == 0) {
		picker = expectedPicker;
	} else if (currPick.picked_by === COMMISH_ID) {
		// If commish did a manual override, it's just a regular pick
		if (commishManualPicks[pick.round] && commishManualPicks[pick.round][pick.pick])
			picker = expectedPicker;
		// If this was someone else's pick, it's a keeper
		// Also if this is commish's keeper
		else if (expectedPicker !== COMMISH_TEAM_ID || (commishKeepers[pick.round] && commishKeepers[pick.round][pick.pick])) {
			pick.type = 'KEEPER';
			pick.team = expectedPicker;
			picker = expectedPicker;
			keepers[pick.team].push(pick);
		}
	}
	if (!picker) {
		pick.type = 'INVALID';
		console.error(`Invalid Picker ${picker} for: \n ${JSON.stringify(pick)}`);
	} else if (!pick.type) {
		pick.team = picker;
		pick.type = 'NORMAL';
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
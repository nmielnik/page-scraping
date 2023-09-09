'use strict';

var ESPNData = require('../data/espnData.js');

module.exports.parseESPNPlayerList = function (playerlistJSON) {
	var players = {};
	playerlistJSON.forEach(function (data) {
		var plyr = {
			id: data['id'],
			firstName: data['firstName'].replace("'",'*'),
			lastName: data['lastName'].replace("'", '*'),
			fullName: data['fullName'].replace("'", '*'),
			positionId: data['defaultPositionId'],
			nflTeamId: ESPNData.NFLTeamESPNIDtoBallersID[data['proTeamId']],
			universeId: data['universeId']
		};
		players[plyr.id] = plyr;
	})
	return players;
};
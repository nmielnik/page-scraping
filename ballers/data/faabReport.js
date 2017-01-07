var cheerio = require('cheerio');
var moment = require('moment');

var FAABReport = {};

function cleanText(text) {
	return text.replace(new RegExp(String.fromCharCode(160), 'g'), ' ')
		.replace(/\*/g, '');
}

function filterText(text) {
	return cleanText(text).replace(/,/g, '').replace(/\./g, '').trim();
}

FAABReport.parseBids = function(html) {
	var $ = cheerio.load(html);

	var date = $('div.gamesmain div.games-pageheader h1 em').text();
	var mDate = moment(date, 'dddd, MMMM D, YYYY');

	var $table = $('div.gamesmain div.games-fullcol > table');

	var $rows = $table.find('tr.tableBody');
	var bids = [];

	$rows.each(function (index, row) {
		var $row = $(row);
		var $cells = $row.find('td');

		var info = {
			date: mDate.toDate(),
			rank: cleanText($cells.eq(0).text()),
			team: cleanText($cells.eq(1).text()),
			bid: parseInt(cleanText($cells.eq(3).text()).replace('$', ''))
		};

		var pInfo = filterText($cells.eq(2)[0].lastChild.nodeValue).split(' ');
		info.player = {
			name: cleanText($cells.eq(2).find('a').text()),
			team: pInfo[0],
			pos: pInfo[1]
		}

		var resultCell = $cells.eq(4);

		// Failed
		if (resultCell.find('span.error').length > 0) {
			info.result = {
				result: filterText(resultCell.find('span.error').text()),
				reason: cleanText(resultCell.find('em').text())
			};
		} else {
			info.result = {
				result: filterText(resultCell.find('strong').text())
			};
			if (resultCell.find('b').length > 0) {
				var droppedPlayer = cleanText(resultCell.find('b').text());
				var droppedPlayerText = filterText(resultCell[0].lastChild.nodeValue).replace('to Waivers', '').trim();
				var dpInfo = droppedPlayerText.split(' ');
				info.result.dropped = {
					name: droppedPlayer,
					team: dpInfo[0],
					pos: dpInfo[1]
				}
			}
		}
		bids.push(info);
	});

	return bids;
}

FAABReport.groupByPlayer = function (bids) {
	var players = {};
	bids.forEach(function (bid) {
		//var playerName = bid.player.name + ' (' + bid.player.pos + ' - ' + bid.player.team + ')';
		var playerName = bid.player.name;
		if (!players[playerName]) {
			players[playerName] = { name: playerName, bids: [] };
		}
		players[playerName].bids.push(bid);
	});

	var playerArr = [];
	Object.keys(players).forEach(function (key) {
		var player = players[key];
		player.bidCount = player.bids.length;
		playerArr.push(player);
	});

	playerArr.sort(function (a, b) {
		if (a.bidCount === b.bidCount) {
			return 0;
		} else if (a.bidCount > b.bidCount) {
			return -1;
		} else {
			return 1;
		}
	});

	playerArr.forEach(function (player) {
		console.log(player.name + ' (' + player.bids.length + ')');
	});
}

FAABReport.sortByCost = function (bids) {
	bids.sort(function (a, b) {
		if (a.bid === b.bid) {
			return 0;
		} else if (a.bid > b.bid) {
			return -1;
		} else {
			return 1;
		}
	});

	bids.forEach(function (bid) {
		console.log('$' + bid.bid + ' ' + bid.player.name + ' (' + bid.date.toLocaleDateString() + ')');
	});
}

module.exports = FAABReport;
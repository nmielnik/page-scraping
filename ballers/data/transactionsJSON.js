var espnPlayerList = require('../data/espnPlayerList.js');
var ESPNData = require('../data/espnData.js');
var SPECIAL_NAMES = require('../data/player-name-special-cases.js').PlayerNames;

// Need to look this up in the database
var NEXT_MOVE_ID = 1868;

var GroupType = { DropAdd: "Add/Drop", Add: "Add", Drop: "Drop", Trade: "Trade" },
    TransType = { Dropped: "Dropped", Waived: "Waived", Signed: "Signed", Claimed: "Claimed", Trade: "Traded", Acquire: "Acquired", Draft: "Drafted", AcceptTrade: "AcceptedTrade", AcceptTradeDrop: "AcceptedTradeDrop" };

/*
180 = Add
181 = Waive
239 = Drop
224 = Accept Trade
244 = Traded
*/

var TRANS = {};

TRANS.parseTransactions = function (year, transJSONs, playersJSON) {
	playerData = espnPlayerList.parseESPNPlayerList(playersJSON);
	var transactions = new Transactions(year);
	transJSONs.forEach(function (json) {
		json.topics.forEach(function (topic) {
			transactions.addGroup(topic);
		})
	});
	transactions.updateTransIds(NEXT_MOVE_ID);
	console.log('Parsed ' + transactions.groups.length + ' transactions with ' + transactions.ignored.length + ' invalid');
	return transactions;
};

var Transactions = function (year) {
    this.year = year;
    this.groups = [];
    this.ignored = [];
}
Transactions.prototype = {
	updateTransIds: function (startingId) {
		var nextId = startingId;
		this.sortTrans();
		this.groups.forEach(function (group) {
			group.id = startingId;
			startingId++;
		});
	},
	sortTrans: function () {
		this.groups = this.groups.sort(function (a, b) { return a.date - b.date });
		this.ignored = this.ignored.sort(function (a, b) { return a.date - b.date });
	},
	addGroup: function (topic) {
		var group = new Group(this.year, topic);

		if (group.action.indexOf('Invalid') == 0 || group.action.indexOf('Ignored') == 0) {
			this.ignored.push(group);
        } else {
            this.groups.push(group);
        }
	},
    toXML: function () {
        var xml = '<BXMLTransactions year="' + this.year + '">';
        this.groups.forEach(function (group) {
            xml += group.toXML();
        });
        xml += "<!-- ******************** IGNORED ******************** -->";
        this.ignored.forEach(function (group) {
            xml += group.toXML();
        });
        xml += '</BXMLTransactions>';
        return xml;
    }
}

var Group = function (iYear, topic) {

	this.date = new Date(topic['date']);
	var self = this;

	this.trans = topic.messages.reduce(function (arr, msg) {
		//try {
			var newTrans = new Transaction(msg);

			//console.log(JSON.stringify(newTrans));
			if (!newTrans.action) {
				console.error(newTrans);
				console.error(JSON.stringify(msg));
			}
			arr.push(newTrans);
			if (newTrans.action === TransType.Acquire) {
				arr.push(newTrans.duplicate({ action: TransType.Trade, team: newTrans.sourceId }));
			}
		/*} catch (exc) {
			console.error(exc);
			//console.error(JSON.stringify(msg));
		}*/
		return arr;
	}, []);

	this.processAction();
}

Group.prototype = {
	processAction: function () {
		if (!this.trans.length)
			this.action = 'Invalid: No Transactions';
		else if (this.trans.some(function (x) { return x.action.indexOf('LM Action') == 0; }))
			this.action = 'Ignored: LM Action';
		else if (this.trans.some(function (x) { return x.action.indexOf('Invalid') == 0; }))
			this.action = 'Invalid: Invalid Trans';
		else if (this.trans.some(function (x) { return x.action == TransType.Trade; }))
			this.action = GroupType.Trade;
		else if (this.trans.some(function (x) { return x.action == TransType.Signed; })) {
			this.action = GroupType.Add;
			if (this.trans.some(function (x) { return x.action == TransType.Waived; }))
				this.action = GroupType.DropAdd;
		}
		else if (this.trans.some(function (x) { return x.action == TransType.Waived; }))
			this.action = GroupType.Drop;
		else if (this.trans.some(function (x) { return x.action == TransType.AcceptTrade || x.action == TransType.AcceptTradeDrop; }))
			this.action = 'Invalid: AcceptedTrade';
		else
			this.action = 'Invalid: Unknown';
	},
    toXML: function () {
        var oD = new Date();
        var innerStr = '';
        var cost = null;
        var str = '<TransGroup';
        str += ' id="' + this.id + '"';
        str += ' type="' + this.action + '"';
        str += ' time="' + this.date.toLocaleTimeString() + '"';
        str += ' date="' + DATETIME.dateToShortDateString(this.date) + '"';
        str += ' day="' + DATETIME.BallersDay[this.date.getDay()] + '"';
        for (var i = 0; i < this.trans.length; i++) {
        	if (this.trans[i].action.indexOf('LM Action') !== 0) {
        		innerStr += this.trans[i].toXML();
        	}
            if (this.trans[i].cost)
                cost = this.trans[i].cost;
        }
        if (cost)
            str += ' cost="' + cost + '"';
        str += '>' + innerStr + '</TransGroup>';
        return str;
    }
}

Transaction = function (msg) {
	if (msg) {
		/*
		var msgType = msg['messageTypeId'];
		if (msgType == 138 || msgType == 167 || msgType == 175 || msgType == 174) {
			throw "LM Note or Move on " + new Date(msg['date']).toString();
		}
		*/

		this.processAction(msg);

		var targetId = msg['targetId'];
		if (targetId && playerData[targetId]) {
			var plyr = playerData[targetId];
			if (SPECIAL_NAMES[plyr.fullName]) {
				var toCopy = SPECIAL_NAMES[plyr.fullName];
				this.player = {
					firstName: toCopy.first,
					lastName: toCopy.last,
					suffix: toCopy.suffix,
					identifier: toCopy.identifier
				};
			} else {
				this.player = { 
					firstName: plyr['firstName'],
					lastName: plyr['lastName']
				};
			}
			this.player.team = plyr['nflTeamId'];
			this.player.position = plyr['positionId'];
		}

		//this.destination = ESPNData.FranchiseBallersIDtoShortName[this.destination] || this.destination;
		//this.source = ESPNData.FranchiseBallersIDtoShortName[this.source] || this.source;
		//this.team = ESPNData.FranchiseBallersIDtoShortName[this.team] || this.team;
	}
}
Transaction.prototype = {
	processAction: function (msg) {
		var type = msg['messageTypeId'];
		switch (type) {
			// Added
			case 180:
				{
					this.action = TransType.Signed;
					this.team = ESPNData.FranchiseESPNIDtoBallersID[msg['to']];
					this.destination = 'Bench';
					this.source = 'Waivers';
					this.cost = msg['from'] || 0;
				}
				break;
			// Waived
			case 181:
				{
					this.action = TransType.Waived;
					this.team = ESPNData.FranchiseESPNIDtoBallersID[msg['to']];
					this.destination = 'Waivers';
					this.sourceId = this.team;
				}
				break;
			// Dropped
			case 239:
				{
					this.action = TransType.Waived;
					this.team = ESPNData.FranchiseESPNIDtoBallersID[msg['for']];
					this.destination = 'Waivers';
					this.sourceId = this.team;
				}
				break;
			// Processed Trade
			case 244:
				{
					this.action = TransType.Acquire;
					this.team = ESPNData.FranchiseESPNIDtoBallersID[msg['to']];
					this.destinationId = ESPNData.FranchiseESPNIDtoBallersID[msg['from']];
					this.sourceId = this.team;
				}
				break;
			// Processed Trade - Dropped Player
			case 245:
				{
					this.action = TransType.Waived;
					this.team = ESPNData.FranchiseESPNIDtoBallersID[msg['from']];
					this.destination = 'Waivers';
					this.sourceId = this.team;
				}
				break;
			// Accepted Trade (Ignored)
			case 224:
				{
					this.action = TransType.AcceptTrade;
					this.team = ESPNData.FranchiseESPNIDtoBallersID[msg['to']];
					this.destinationId = ESPNData.FranchiseESPNIDtoBallersID[msg['from']];
					this.sourceId = this.team;
				}
				break;
			// Accepted Trade - Dropped Player (Ignored)
			case 225:
				{
					this.action = TransType.AcceptTradeDrop;
					this.team = ESPNData.FranchiseESPNIDtoBallersID[msg['from']];
					this.destination = 'Waivers';
					this.sourceId = this.team;
				}
				break;
			case 138:
			case 167:
			case 174:
			case 175:
				{
					this.action = "LM Action";
				}
				break;
			default:
				{
                	this.action = "Invalid: " + type;
                 	console.log(JSON.stringify(msg, null, 2));
                }
                break;
		}
	},
    duplicate: function (oProps) {
        var oTrans = new Transaction();
        oProps = oProps || {};
        oTrans.team = (oProps.team || this.team);
        oTrans.destination = (oProps.destination || this.destination);
        oTrans.source = (oProps.source || this.source);
        oTrans.destinationId = (oProps.destinationId || this.destinationId);
        oTrans.sourceId = (oProps.sourceId || this.sourceId);
        oTrans.player = (oProps.player || this.player);
        oTrans.action = (oProps.action || this.action);
        oTrans.cost = (oProps.cost || this.cost);
        return oTrans;
    },
    toXML: function () {
        var str = '<Transaction';
        str += ' franchiseId="' + this.team + '" type="' + this.action + '"';
        str += ' plyrFirst="' + this.player.firstName + '" plyrLast="' + this.player.lastName + '"';
        if (this.player.suffix)
        	str += ' plyrSuffix="' + this.player.suffix + '"';
        if (this.player.identifier)
        	str += ' plyrIdentifier="' + this.player.identifier + '"';
        str += ' teamId="' + this.player.team + '" posId="' + this.player.position + '"';
        if (this.destination)
        	str += ' dest="' + this.destination + '"';
        if (this.destinationId)
        	str += ' destId="' + this.destinationId + '"';
        if (this.source)
        	str += ' src="' + this.source + '"';
        if (this.sourceId)
        	str += ' srcId="' + this.sourceId + '"';
        str += '/>';
        return str;
    }
};

var DATETIME = {};
DATETIME.BallersDay = [5, 6, 7, 1, 2, 3, 4];

DATETIME.dateToShortDateString = function (date) {
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
};

module.exports = TRANS;
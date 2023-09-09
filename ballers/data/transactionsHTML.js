var cheerio = require('cheerio');

function exists(o) { return o || (o === false || o === '' || o === 0) };
function isString(s) { return typeof (s) == 'string' }

// Need to look this up in the database
var NEXT_MOVE_ID = 1544;

var TRANS = {},
    STRING = {},
    DATETIME = {},
    GroupType = { DropAdd: "Add/Drop", Add: "Add", Drop: "Drop", Trade: "Trade" },
    TransType = { Dropped: "Dropped", Waived: "Waived", Signed: "Signed", Claimed: "Claimed", Trade: "Traded", Acquire: "Acquired", Draft: "Drafted" };

TRANS.parseTransactions = function (iYear, html) {

    var $ = cheerio.load(html),
        transactions = new Transactions(iYear, NEXT_MOVE_ID),
        $rows = null,
        $table = $('table.tableBody');

    if ($table && $table.length === 1) {
        $rows = $table.find('tr');
    }

    if ($rows && $rows.length > 0) {
        var rows = [];
        console.log('Parsing ' + ($rows.length - 2) + ' Table Rows');
        $rows.each(function (idx, elRow) {
            if (idx >= 2) {
                // Transactions are listed in reverse date order
                rows.unshift($(elRow));
            }
        });
        rows.forEach(function ($row) {
            transactions.addGroup($row);
        });
    } else {
        console.log('Table Not Found!');
    }
    console.log('Parsed ' + transactions.groups.length + ' transactions with ' + transactions.ignored.length + ' invalid');

    return transactions;
};

var Transactions = function (year, nextMoveId) {
    this.year = year;
    this.groups = [];
    this.ignored = [];

    this.nextMoveId = nextMoveId;
}
Transactions.prototype = {
    addGroup: function ($row) {
        var oGroup = new Group(this.nextMoveId, $row.find('td'), this.year);

        if (!STRING.startsWith(oGroup.action, 'Invalid ', true)) {
            this.groups.push(oGroup);
            this.nextMoveId++;
        } else {
            this.ignored.push(oGroup);
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

var Group = function (id, $cells, iYear) {
    this.id = id;
    this.trans = [];
    this.date = DATETIME.ParseESPNTableCell($cells.get(0), iYear);
    var typeCell = $cells.get(1);
    var action = typeCell.childNodes[5] ? typeCell.childNodes[5].nodeValue : typeCell.childNodes[4].nodeValue;

    //this.setAction(elRow.cells[1].childNodes[5].nodeValue);
    if (!action) {
        console.log('**************** ERROR ACTION ********************');
        console.log(typeCell.childNodes.length + ' nodes');
        typeCell.childNodes.forEach(function (node) {
            console.log(node.nodeValue);
        });
    }
    this.setAction(action);

    var elTrans = $cells.get(2);
    var children = elTrans.childNodes;
    var iNumTrans = Math.ceil(children.length / 4);
    var iNode = 0;
    for (var iTrans = 0; iTrans < iNumTrans; iTrans++) {
        var lastNode = (iNode + 3) <= children.length ? children[iNode + 3] : null;
        var oNextTrans = new Transaction(children[iNode],
                                           children[iNode + 1],
                                           children[iNode + 2],
                                           lastNode);
        this.trans.push(oNextTrans);
        if (GroupType.Trade === this.action && TransType.Trade === oNextTrans.action) {
            var sOtherTeam = (oNextTrans.team == oNextTrans.destination) ? oNextTrans.source : oNextTrans.destination;
            this.trans.push(oNextTrans.duplicate({ action: TransType.Acquire, team: sOtherTeam }));
        }

        iNode += 4;
    }
}

Group.prototype = {
    setAction: function (sActionData) {
        var ignoreSuffixes = [' (joe lazzaro)', ' (nate mielnik)', ' (geoffrey wright)', ' (mark baver)', ' (by lm)', ' (<a href="http://sportsnation.espn.go.com/fans/jrsyjoe4" target="_blank">Joe Lazzaro</a>)'];
        var editedAction = sActionData.toLowerCase();
        ignoreSuffixes.forEach(function (toIgnore) {
            if (editedAction.indexOf(toIgnore) !== -1) {
                editedAction = editedAction.split(toIgnore)[0];
            }
        });
        switch (editedAction) {
            case 'add/drop':
            case 'add/drop (':
                this.action = GroupType.DropAdd;
                break;
            case 'add':
            case 'add (waivers)':
            case 'add (':
                this.action = GroupType.Add;
                break;
            case 'drop':
            case 'drop (':
                this.action = GroupType.Drop;
                break;
            case 'trade upheld':
            case 'trade processed':
                this.action = GroupType.Trade;
                break;
            default:
                console.log('INVALID ACTION: ' + sActionData);
                this.action = "Invalid " + sActionData;
                break;
        }
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
            innerStr += this.trans[i].toXML();
            if (exists(this.trans[i].cost))
                cost = this.trans[i].cost;
        }
        if (exists(cost))
            str += ' cost="' + cost + '"';
        str += '>' + innerStr + '</TransGroup>';
        return str;
    }
}

Transaction = function (elTeam, elPlayer, elMove, elLast) {
    if (elTeam && elPlayer && elMove) {
        var arrParts = elTeam.nodeValue.split(" ");
        this.team = arrParts[0];
        this.action = arrParts[1];

        var sMoveData = elMove.nodeValue.substr(2);
        arrParts = sMoveData.split(" to ");
        var infoParts = arrParts[0].split(" from ");

        var dest = arrParts[1];
        var destReg = /^\s?([^\s]+)\s+for\s+$/g;
        var res = destReg.exec(arrParts[1]);
        if (exists(res)) {
            dest = res[1];
            var costReg = /\$([0-9]+)$/g;
            if (elLast && elLast.childNodes) {
                res = costReg.exec(elLast.childNodes[0].nodeValue);
                if (exists(res))
                    this.cost = parseInt(res[1]);
            }
        }
        this.setDestination(dest.trim());
        this.source = (infoParts.length > 1) ? infoParts[1] : this.team;

        var plyrParts = infoParts[0].split(" ");
        var sPlyrNameData = elPlayer.childNodes[0].nodeValue;
        var plyrName = sPlyrNameData.split(" ");
        this.player = { firstName: plyrName[0], lastName: sPlyrNameData.substr(plyrName[0].length + 1), team: plyrParts[0], position: plyrParts[1] };
        while (this.player.lastName && STRING.endsWith(this.player.lastName, '*')) {
            this.player.lastName = this.player.lastName.substr(0, this.player.lastName.length - 1);
        }

        this.setAction(this.action)
    }
}
Transaction.prototype = {
    setAction: function (sActionData) {
        switch (sActionData.toLowerCase()) {
            case "dropped":
                {
                    if (STRING.equals('free agency', this.destination, true)) {
                        this.action = TransType.Dropped;
                    }
                    else {
                        this.action = TransType.Waived;
                    }
                }
                break;
            case "added":
                {
                    if (STRING.equals('free agency', this.source, true)) {
                        this.action = TransType.Signed;
                    }
                    else if (STRING.equals('waivers', this.source, true)) {
                        this.action = TransType.Claimed;
                    }
                    else {
                        this.action = "Invalid (Add): " + sActionData;
                    }
                }
                break;
            case TransType.Dropped.toLowerCase():
                this.action = TransType.Dropped;
                break;
            case TransType.Waived.toLowerCase():
                this.action = TransType.Waived;
                break;
            case TransType.Signed.toLowerCase():
                this.action = TransType.Signed;
                break;
            case TransType.Claimed.toLowerCase():
                this.action = TransType.Claimed;
                break;
            case "traded":
            case TransType.Trade.toLowerCase():
                this.action = TransType.Trade;
                break;
            case "tradedto":
            case TransType.Acquire.toLowerCase():
                this.action = TransType.Acquire;
                break;
            case "drafted":
            case TransType.Draft.toLowerCase():
                this.action = TransType.Draft;
                break;
            default:
                this.action = "Invalid: " + sActionData;
                break;
        }
    },
    setDestination: function (sDest) {
        switch (sDest.toLowerCase()) {
            case 'titties':
                this.destination = "TITS";
                break;
            case 'meathooks':
                this.destination = "HOOK";
                break;
            case 'kennelz':
                this.destination = "VICK";
                break;
            case 'turner':
                this.destination = "IKE";
                break;
            case 'stepdads':
                this.destination = "DP";
                break;
            case 'seattlites':
                this.destination = "SEA";
                break;
            case 'tomahawks':
                this.destination = "SwaT";
                break;
            case 'gang green':
                this.destination = "BIG";
                break;
            case 'silly nannies':
                this.destination = "LSN";
                break;
            case 'mills':
                this.destination = "MILL";
                break;
            case 'aficionados':
                this.destination = "RBA";
                break;
            case 'puerburrito':
                this.destination = "PUER";
                break;
            case 'law':
                this.destination = "LAW";
                break;
            case 'mob':
                this.destination = "MOB";
                break;
            default:
                this.destination = sDest;
                break;
        }
    },
    duplicate: function (oProps) {
        var oTrans = new Transaction();
        oProps = oProps || {};
        oTrans.team = (oProps.team || this.team);
        oTrans.destination = (oProps.destination || this.destination);
        oTrans.source = (oProps.source || this.source);
        oTrans.player = (oProps.player || this.player);
        oTrans.setAction(oProps.action || this.action);
        return oTrans;
    },
    toXML: function () {
        var str = '<Transaction';
        str += ' franId="' + this.team + '" type="' + this.action + '"';
        str += ' plyrFirst="' + this.player.firstName + '" plyrLast="' + this.player.lastName + '"';
        str += ' team="' + this.player.team + '" pos="' + this.player.position + '"';
        str += ' dest="' + this.destination + '" src="' + this.source + '"/>';
        return str;
    }
}

STRING.startsWith = function(target, prefix, ignoreCase) {
    if (!isString(target) || !isString(prefix))
        return false;
    var thisString = (ignoreCase) ? target.toUpperCase() : target;
    var thatString = (ignoreCase) ? prefix.toUpperCase() : prefix;
    return (thisString.indexOf(thatString) == 0);
}

STRING.endsWith = function (target, suffix, ignoreCase) {
    if (!isString(target) || !isString(suffix))
        return false;
    var thisString = (ignoreCase) ? target.toUpperCase() : target;
    var thatString = (ignoreCase) ? suffix.toUpperCase() : suffix;
    return (thisString.indexOf(thatString) == thisString.length - 1);
}

STRING.equals = function(target, otherString, ignoreCase) {
    if (!isString(target) || !isString(otherString))
        return false;
    if (ignoreCase)
        return target.toLowerCase() == otherString.toLowerCase();
    else
        return target == otherString;
}

DATETIME.Unit = { Month: 1, Day: 2 };
DATETIME.DOWMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
DATETIME.MonthMap = ['Januray', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
DATETIME.BallersDay = [5, 6, 7, 1, 2, 3, 4];

DATETIME.dateToShortDateString = function (date) {
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
};

DATETIME.convertStringToInt = function (eUnit, sStr) {
    var oMap = DATETIME._getMap(eUnit);
    var iVal = -1;
    if (oMap) {
        for (var i = 0; i < oMap.length; i++) {
            if (STRING.equals(oMap[i], sStr, true) || STRING.startsWith(oMap[i], sStr, true)) {
                iVal = i;
                break;
            }
        }
    }
    return iVal;
};

DATETIME.covertIntToString = function (eUnit, iVal, sShort) {
    var oMap = DATETIME._getMap(eUnit);
    var sVal = "Invalid";
    if (oMap && iVal >= 0 && iVal < oMap.length) {
        sVal = (sShort) ? oMap[iVal].substr(0, 3) : oMap[iVal];
    }
    return sVal;
};

DATETIME._getMap = function (eUnit) {
    var oMap = null;
    switch (eUnit) {
        case DATETIME.Unit.Month:
            oMap = DATETIME.MonthMap;
            break;
        case DATETIME.Unit.Day:
            oMap = DATETIME.DOWMap;
            break;
    }
    return oMap;
};

DATETIME.ParseESPNTableCell = function (elCell, iYear) {
    // Date
    var arrParts = elCell.childNodes[0].nodeValue.split(" ");
    var sDayOfWeek = arrParts[0].substr(0, arrParts[0].length - 1);
    var iMonth = DATETIME.convertStringToInt(DATETIME.Unit.Month, arrParts[1]);
    var iDate = parseInt(arrParts[2]);

    // Time
    arrParts = elCell.childNodes[2].nodeValue.split(" ");
    var arrTimeParts = arrParts[0].split(":");
    var iHours = parseInt(arrTimeParts[0]);
    if (STRING.equals('pm', arrParts[1], true) && iHours < 12) {
        iHours += 12;
    }
    var iMinutes = parseInt(arrTimeParts[1]);

    if (iMonth <= 4) {
        iYear++;
    }

    return new Date(iYear, iMonth, iDate, iHours, iMinutes, 0, 0);
};

module.exports = TRANS;
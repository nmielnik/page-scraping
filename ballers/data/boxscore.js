var cheerio = require('cheerio');

function exists(val) { return ((val) ? true : (val == 0 || val == false || val == "")) };

var BoxScore = {},
    LineupObj,
    PlayerObj;


Math.roundDigits = function(num, places)
{
    var val = 0;
    if (isNaN(num))
        val = NaN;
    else
    {
        var numNum = Number(num);
        var str = '' + numNum;
        var parts = str.split('.');
        var val = Number(parts[0]);
        var suffix = (parts.length > 1) ? parts[1] : '0';
        
        var strDec = '';
        var fRound = true;
        for (var i = places; i >= 0; i--)
        {
            if (i < suffix.length)
            {
                var intVal = Number(suffix.charAt(i));
                if (fRound)
                {
                    if (i == places)
                    {
                        fRound = intVal >= 5;
                    }
                    else
                    {
                        if (intVal == 9)
                        {
                            strDec = '0' + strDec;
                        }
                        else
                        {
                            intVal++;
                            strDec = intVal + strDec;
                            fRound = false;
                        }
                    }
                }
                else
                {
                    strDec = intVal + strDec;
                }
            }
            else
            {
                if (i < places)
                    strDec = '0' + strDec;
                fRound = false;
            }
        }
        val = Number(val + '.' + strDec);
        if (numNum < 0 && val > 0)
            val = 0 - val;
    }
    return val;
}

BoxScore.parseTitleData = function($title)
{
    var data = {};
    var title = $title.text();
    var splitOn = (title.indexOf(" vs ") > -1) ? " vs " : (title.indexOf(" at ") > -1 ? " at " : null);
    if (splitOn)
    {
        var arrSplit = title.split(splitOn);
        data.homeTeam = arrSplit[0];
        data.awayTeam = arrSplit[1];

        var playoffs = (data.awayTeam.indexOf(" Box Score: Round ") > 0)
        splitOn = (!playoffs) ? " Box Score: Week " : "Box Score: Round ";
        arrSplit = data.awayTeam.split(splitOn);
        data.awayTeam = arrSplit[0];
        data.week = arrSplit[1];

        arrSplit = data.week.split(" -");
        if (playoffs)
            data.week = 13 + parseInt(arrSplit[0]);
        else
            data.week = arrSplit[0];
    }
    // This is a BYE week (only one team has a box score)
    else
    {
        var arrSplit = title.split(" Box Score: Round ");
        data.homeTeam = arrSplit[0];
        data.awayTeam = null;
        data.week = arrSplit[1];

        arrSplit = data.week.split(" -");
        data.week = 13 + parseInt(arrSplit[0]);
    }

    return data;
}

BoxScore.parseBoxScore = function(html, playerStats)
{
    var $ = cheerio.load(html);

    var oTitleData = BoxScore.parseTitleData($('head title'));

    $('span[title="Probable"], span[title="Questionable"], span[title="Doubtful"], span[title="Out"]').remove();

    var tableNames = ["playertable_0", "playertable_1", "playertable_2", "playertable_3", "playertable_4", "playertable_5", "playertable_6",
                  "playertable_7", "playertable_8", "playertable_9", "playertable_10", "playertable_11", "playertable_12"],
    arrPlayers = [],
    arrStarters = [],
    arrBench = [],
    oppStarters = [],
    oppBench = [],
    inBench = false,
    inOpp = false;

    tableNames.forEach(function (str) {
        var $table = $('#' + str);
        if ($table.length > 0)
            arrPlayers = arrPlayers.concat(BoxScore.parsePlayerTable($table, $));
        else
            return false;
    });
    
    arrPlayers.forEach(function (plyr) {
        // Merge stats from scoring summary
        if (plyr.id && playerStats[plyr.id]) {
            var plyrStats = playerStats[plyr.id];
            StatTypes.forEach(function (info) {
                if (info.output && !StatValueOverrides[info.id]) {
                    var statVal = plyrStats.getStatValue(info.id);
                    if (statVal) {
                        plyr.stats[info.id] = statVal;
                    }
                }
            }, this);
        }

        if (inBench && (plyr.slot != "Bench" && plyr.slot != "IR")) {
            inBench = false;
            inOpp = true;
        }
        else if (!inBench) {
            inBench = (plyr.slot == "Bench" || plyr.slot == "IR");
        }

        if (!inBench) {
            if (inOpp)
                oppStarters.push(plyr);
            else
                arrStarters.push(plyr);
        } else {
            if (inOpp)
                oppBench.push(plyr);
            else
                arrBench.push(plyr);
        }
    });

    var lineup = new LineupObj(oTitleData.homeTeam, oTitleData.week, arrStarters, arrBench);
    var oppLineup = (oTitleData.awayTeam && oppStarters.length > 0) ? new LineupObj(oTitleData.awayTeam, oTitleData.week, oppStarters, oppBench) : null;
    lineup.setOpponent(oppLineup);

    return lineup;

/*    var strFile = "C:\\Temp\\week" + lineup.week + "-parsed.xml";

    writeToFile(lineup.toString(), strFile);
    if (oppLineup)
        writeToFile(oppLineup.toString(), strFile);
    console.log('------------- Box Score Parsing Complete ---------------');
    console.log(lineup.getGameDescription());
    console.log(lineup.toSummaryString());
*/
}

BoxScore.parsePlayerTable = function($table, $)
{
    var $rows = $table.find('tr'),
        players = [];
    $rows.each(
        function(idx, elRow)
        {
            var $row = $(elRow);
            if ($row.hasClass('pncPlayerRow') && ($row.hasClass('playerTableBgRow0') || $row.hasClass('playerTableBgRow1')))
            {
                players.push(BoxScore.buildPlayerFromRow($row, $));
            }
        }
    );
    return players;
}

BoxScore.buildPlayerFromRow = function($row, $)
{
    var player = new PlayerObj($row.attr('id'));
    var statIdx = 0;
    var statOrder = NormalStatOrder;

    var $cells = $row.find('td');
    $cells.each(
        function(idx, elCell)
        {
            var $cell = $(elCell);
            if ($cell.hasClass('sectionLeadingSpacer'))
            {
                return true;
            }
            else if ($cell.hasClass('playerSlot'))
            {
                player.slot = getCleanValue($cell.text());
            }
            else if ($cell.hasClass('playertablePlayerName'))
            {
                var rawName = getCleanValue($cell.text()).replace(/\*/gi, '').replace(/St\. /gi, 'St.').trim();
                if (rawName.indexOf(', ') == -1)
                {
                    var parts = rawName.split(' ');
                    player.splitAndSet(rawName, ' ', ['firstName', 'lastName', 'position']);
                    if (exists(DefenseInfo[player.firstName]))
                        player.team = DefenseInfo[player.firstName];
                    else
                        player.team = player.firstName;
                }
                else
                {
                    var parts = rawName.split(', ');
                    /* PLAYER NAME PARSING
                    var tempParts = parts[0].split(' ');
                    if (tempParts.length > 2) {
                        console.log(JSON.stringify(tempParts));
                    }*/
                    player.splitAndSet(parts[0], ' ', ['firstName', 'lastName']);
                    var infoParts = parts[1].replace(/,/gi, '').split(' ');
                    player.team = getCleanValue(infoParts[0]);
                    for (var i = 1; i < infoParts.length; i++)
                    {
                        var pos = getCleanValue(infoParts[i]).trim();
                        if (Positions[pos])
                        {
                            if (player.position)
                                player.position += '/' + pos;
                            else
                                player.position = pos;
                        }
                    }
                }
                if (player.position == "K")
                    statOrder = KickerStatOrder;
                else if (player.position == "D/ST")
                    statOrder = DefenseStatOrder;

                if (player.firstName == "Empty")
                    return false;
            }
            else if (!$cell.attr('class') || $cell.attr('class').trim().length == 0)
            {
                player.opponent = getCleanValue($cell.text());

                if (player.opponent.indexOf("BYE") > 0)
                    return false;
            }
            else if ($cell.hasClass('gameStatusDiv'))
            {
                var statusParts = $cell.text().trim().split(' ');
                if (statusParts.length > 1)
                {
                    var scoreParts = getCleanValue(statusParts[statusParts.length - 1]).split('-');
                    player.teamScore = Math.roundDigits(scoreParts[0], 2);
                    player.opponentScore = Math.roundDigits(scoreParts[1], 2);
                    if (statusParts.length > 2)
                    {
                        player.teamResult = getCleanValue(statusParts[statusParts.length - 2]);
                    }
                }
            }
            else if ($cell.hasClass('playertableStat'))
            {
                if ($cell.hasClass('appliedPoints'))
                {
                    player.points = Math.roundDigits(getCleanValue($cell.text()), 2);
                }
                else
                {
                    var vals = $cell.text().trim().split('/');
                    for (var i = 0; i < vals.length; i++, statIdx++)
                    {
                        player.stats[statOrder[statIdx]] = Math.roundDigits(getCleanValue(vals[i]), 2);
                    }
                }
            }
        }
    );
    if (!player.id || !player.firstName)
    {
        player.firstName = 'Empty';
        player.lastName = 'Slot';
        player.position = 'NONE';
        player.team = 'EMPTY';
        player.opponent = '@None';
        player.teamScore = 0;
        player.opponentScore = 0;
    }
    return player;
}

function getCleanValue(str)
{
    return str.trim().replace(new RegExp(unescape('%A0'), 'g'), ' ').replace(/\s?\*\*\s?/g, '').replace(/\-\-/g, '0');
}

var StatInfo = function(name, fXMLOnly, fHTMLOnly)
{
    this.xml = name;
    this.id = StatID[name];
    this.parse = !fXMLOnly;
    this.output = !fHTMLOnly;
}

var Positions = { RB: true, WR: true, TE: true, QB: true, 'D/ST': true, DST: true, K: true };

var DefenseInfo =
{
    Dolphins: 'Mia',
    Bills: 'Buf',
    Patriots: 'NE',
    Jets: 'NYJ',
    Bengals: 'Cin',
    Browns: 'Cle',
    Steelers: 'Pit',
    Ravens: 'Bal',
    Texans: 'Hou',
    Titans: 'Ten',
    Jaguars: 'Jac',
    Colts: 'Ind',
    Chargers: 'SD',
    Broncos: 'Den',
    Raiders: 'Oak',
    Chiefs: 'KC',
    Seahawks: 'Sea',
    '49ers': 'SF',
    Rams: 'Stl',
    Cardinals: 'Ari',
    Lions: 'Det',
    Packers: 'GB',
    Vikings: 'Min',
    Bears: 'Chi',
    Saints: 'NO',
    Panthers: 'Car',
    Buccaneers: 'TB',
    Falcons: 'Atl',
    Giants: 'NYG',
    Cowboys: 'Dal',
    Redskins: 'Wsh',
    Eagles: 'Phi'
}

var StatID =
{
    Attempts: 0,
    Completions: 1,
    PassYds: 3,
    PassTDs: 4,
    Pass2PC: 5, /* HTML Only */
    PassINTs: 20,
    RushAtt: 23,
    RushYds: 24,
    RushTDs: 25,
    Rush2PC: 26, /* HTML Only */
    RecYds: 42,
    RecTDs: 43,
    Rec2PC: 44, /* HTML Only */
    Rec: 53,
    TwoPt: 62,
    FumRecTD: 63,
    Fum: 71,
    FL: 72,
    FG49: 77,
    FG49Att: 78, /* HTML Only */
    FG50: 74,
    FG50Att: 75, /* HTML Only */
    FG39: 80,
    FG39Att: 81, /* HTML Only */
    FG: 83, /* HTML Only */
    FGAtt: 84, /* HTML Only */
    XP: 86,
    XPAtt: 87, /* HTML Only */
    DefTD: 94,
    DefINT: 95,
    DefFR: 96,
    DefBlk: 97,
    DefSfty: 98,
    DefSack: 99,
    KOffTD: 101,
    PuntTD: 102,
    RetTD: 105,
    DefPA: 120,

    Pts: 1000, /* XML Only */
    Tar: 1001, /* HTML Only */
    FG49M: 1077, /* XML Only */
    FG50M: 1074, /* XML Only */
    FG39M: 1080, /* XML Only */
    XPM: 1086, /* XML Only */

    KRetYds: 2001,
    PRetYds: 2002,
    KRetTD: 2003,
    PRetTD: 2004,
    FumRetTD: 2005
};

var NormalStatOrder = [StatID.Completions, StatID.Attempts, StatID.PassYds, StatID.PassTDs, StatID.PassINTs,
                   StatID.RushAtt, StatID.RushYds, StatID.RushTDs,
                   StatID.Rec, StatID.RecYds, StatID.RecTDs, StatID.Tar,
                   StatID.TwoPt, StatID.FL, StatID.RetTD];

var KickerStatOrder = [StatID.FG39, StatID.FG39Att, StatID.FG49, StatID.FG49Att, StatID.FG50, StatID.FG50Att, StatID.FG, StatID.FGAtt, StatID.XP, StatID.XPAtt];

var DefenseStatOrder = [StatID.DefTD, StatID.DefINT, StatID.DefFR, StatID.DefSack, StatID.DefSfty, StatID.DefBlk, StatID.DefPA];

var StatTypes = [new StatInfo('Pts', true), new StatInfo('Tar', false, true), new StatInfo('Attempts'), new StatInfo('Completions'), new StatInfo('PassYds'), new StatInfo('PassTDs'),
             new StatInfo('Pass2PC', false, true), new StatInfo('PassINTs'), 
             new StatInfo('RushAtt'), new StatInfo('RushYds'), new StatInfo('RushTDs'), new StatInfo('Rush2PC', false, true),
             new StatInfo('RecYds'), new StatInfo('RecTDs'), new StatInfo('Rec2PC', false, true), new StatInfo('Rec'), 
             new StatInfo('TwoPt'), new StatInfo('Fum'), new StatInfo('FL'), 
             new StatInfo('FG49'), new StatInfo('FG49Att', false, true), new StatInfo('FG49M', true),
             new StatInfo('FG50'), new StatInfo('FG50Att', false, true), new StatInfo('FG50M', true), 
             new StatInfo('FG39'), new StatInfo('FG39Att', false, true), new StatInfo('FG39M', true), 
             new StatInfo('FG', false, true), new StatInfo('FGAtt', false, true), new StatInfo('XP'), new StatInfo('XPAtt', false, true), new StatInfo('XPM', true), 
             new StatInfo('DefTD'), new StatInfo('DefINT'), new StatInfo('DefFR'), new StatInfo('DefBlk'), new StatInfo('DefSfty'),
             new StatInfo('DefSack'), new StatInfo('KOffTD'), new StatInfo('PuntTD'), new StatInfo('RetTD'), new StatInfo('DefPA'),
             new StatInfo('KRetYds'), new StatInfo('PRetYds'), new StatInfo('KRetTD'), new StatInfo('PRetTD'), new StatInfo('FumRetTD'), new StatInfo('FumRecTD')];

var StatValueOverrides = [];
StatValueOverrides[StatID.FG39M] = function() { return this.getStatValue(StatID.FG39Att) - this.getStatValue(StatID.FG39) };
StatValueOverrides[StatID.FG49M] = function() { return this.getStatValue(StatID.FG49Att) - this.getStatValue(StatID.FG49) };
StatValueOverrides[StatID.FG50M] = function() { return this.getStatValue(StatID.FG50Att) - this.getStatValue(StatID.FG50) };
StatValueOverrides[StatID.XPM] = function() { return this.getStatValue(StatID.XPAtt) - this.getStatValue(StatID.XP) };
StatValueOverrides[StatID.Pts] = function() { return this.points };

PlayerObj = function(iRowId)
{
    this.id = iRowId;

    this.slot = this.firstName = this.lastName = this.position = null;
    this.team = this.opponent = this.teamResult = this.teamScore = this.opponentScore = null;
    this.points = 0;

    this.stats = [];
    StatTypes.forEach(function (info) {
        this.stats[info.id] = 0;
    }, this);
}
PlayerObj.prototype =
{
    splitAndSet: function(rawValue, splitBy, arrProps)
    {
        var parts = rawValue.split(splitBy);
        parts.forEach(function (str, idx) {
            if (idx < arrProps.length) {
                this[arrProps[idx]] = str;
            }
        }, this);
        return this;
    },
    getStatValue: function(eStatType)
    {
        return exists(StatValueOverrides[eStatType]) ? StatValueOverrides[eStatType].call(this) : (!isNaN(this.stats[eStatType]) ? this.stats[eStatType] : 0);
    },
    toString: function()
    {
        var first = this.firstName.replace("'", "*"),
            last = this.lastName.replace("'", "*"),
            infoStr = ['<Player id="' + this.id,
                       'slot="' + this.slot,
                       'first="' + first,
                       'last="' + last,
                       'pos="' + this.position,
                       'team="' + this.team,
                       'opp="' + this.opponent,
                       'result="' + this.teamResult,
                       'oppScore="' + this.opponentScore
                       ].join('" ') + '">\r\n';
        StatTypes.forEach(function (info) {
            if (info.output && exists(this.stats[info.id])) {
                infoStr += '<' + info.xml + '>' + this.getStatValue(info.id) + '</' + info.xml + '>\r\n';
            }
        }, this);
        infoStr += '</Player>\r\n';
        return infoStr;
    }
}

LineupObj = function(iTeamId, iWeekId, arrStarters, arrBench, result)
{
    this.teamId = iTeamId;
    this.week = iWeekId;
    this.slots = [];
    this.starters = arrStarters;
    this.bench = arrBench;
    this.result = result;
    this.strtPts = this.bnchPts = this.oppPts = this.oppBnchPts = 0;
    this.opp = '';

    this.assignSlots();
}
LineupObj.prototype =
{
    getGameDescription: function() { return this.teamId + ' vs ' + this.opp + ' - Week ' + this.week },
    toSummaryString: function() { return this.result + ' (' + this.strtPts + ' - ' + this.oppPts + ') - Benches: [' + this.bnchPts + ' - ' + this.oppBnchPts + ']' },
    setOpponent: function(oLineup)
    {
        this.result = (exists(oLineup) && this.strtPts < oLineup.strtPts) ? "L" : "W";

        if (exists(oLineup))
        {
            this.oppLineup = oLineup;
            this.opp = oLineup.teamId;
            this.oppPts = oLineup.strtPts;
            this.oppBnchPts = oLineup.bnchPts;
            if (oLineup.opp != this.teamId)
                oLineup.setOpponent(this);
        }
        else
        {
            this.opp = "BYE";
            this.oppPts = 0;
        }
    },
    assignSlots: function()
    {
        for (var i = 0; i < this.starters.length; i++)
        {
            var currPlayer = this.starters[i];
            this.strtPts += currPlayer.getStatValue(StatID.Pts);
            var currSlot = currPlayer.slot;
            if (!exists(this.slots[currSlot]))
            {
                this.slots[currSlot] = currPlayer;
            }
            else
            {
                var uniq = 1;
                var newSlot = currSlot + uniq;
                while (this.slots[newSlot])
                {
                    uniq++;
                    newSlot = currSlot + uniq;
                }
                this.slots[newSlot] = currPlayer;
                currPlayer.slot = newSlot;
            }
        }
        this.strtPts = Math.roundDigits(this.strtPts, 2);
        for (var i = 0; i < this.bench.length; i++)
        {
            var currPlayer = this.bench[i];
            this.bnchPts += currPlayer.getStatValue(StatID.Pts);
            var currSlot = currPlayer.slot;
            if (!exists(this.slots[currSlot]))
            {
                this.slots[currSlot] = currPlayer;
            }
            else
            {
                var benchNum = 1;
                var newSlot = currSlot + benchNum;
                while (this.slots[newSlot])
                {
                    benchNum++;
                    newSlot = currSlot + benchNum;
                }
                this.slots[newSlot] = currPlayer;
                currPlayer.slot = newSlot;
            }
        }
        this.bnchPts = Math.roundDigits(this.bnchPts, 2);
    },
    toString: function()
    {
        var sRet = '<Lineup week="' + this.week + '" teamID="' + this.teamId + '" points="' + this.strtPts + '" bench="' + this.bnchPts;
        sRet += '" result="' + this.result + '" opponent="' + this.opp + '" opponentScore="' + this.oppPts + '" >\r\n';
        this.starters.forEach(function (oPlayer) {
            sRet += oPlayer.toString();
        });
        this.bench.forEach(function (oPlayer) {
            sRet += oPlayer.toString();
        });
        sRet += '</Lineup>\r\n';
        return sRet;
    }
}

module.exports = {
    BoxScore: BoxScore,
    LineupObj: LineupObj,
    PlayerObj: PlayerObj
};
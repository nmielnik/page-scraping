var cheerio = require('cheerio');

function exists(val) { return ((val) ? true : (val == 0 || val == false || val == "")) };

var ScoringSummary = {},
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

ScoringSummary.parseScoringSummary = function(html)
{
    var $ = cheerio.load(html);

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
            arrPlayers = arrPlayers.concat(ScoringSummary.parsePlayerTable($table, $));
        else
            return false;
    });

    var playerScoring = {};

    arrPlayers.forEach(function (plyr) {
        if (plyr.id && !playerScoring[plyr.id]) {
            playerScoring[plyr.id] = plyr;
        }
    });

    return playerScoring;
}

ScoringSummary.parsePlayerTable = function($table, $)
{
    var $rows = $table.find('tr'),
        players = [];
    $rows.each(
        function(idx, elRow)
        {
            var $row = $(elRow);
            if ($row.hasClass('pncPlayerRow') && ($row.hasClass('playerTableBgRow0') || $row.hasClass('playerTableBgRow1')))
            {
                players.push(ScoringSummary.buildPlayerFromRow($row, $));
            }
        }
    );
    return players;
}

ScoringSummary.buildPlayerFromRow = function($row, $)
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
                    var title = $cell.find('span').attr('title');
                    player.stats[statOrder[statIdx]] = title ? parseInt(getStatFromCalc(title), 10) : 0;
                    statIdx++;
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

function getStatFromCalc(str)
{
    return str.split('*')[0];
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

var NormalStatOrder = [StatID.PassYds, StatID.PassTDs, StatID.Pass2PC, StatID.PassINTs, 
                    StatID.RushYds, StatID.RushTDs, StatID.Rush2PC,
                    StatID.RecYds, StatID.RecTDs, StatID.Rec2PC, StatID.Rec,
                    StatID.FumRecTD, StatID.Fum, StatID.FL,
                    StatID.KRetTD, StatID.PRetTD, StatID.FumRetTD, StatID.KRetYds, StatID.PRetYds];

var StatTypes = [new StatInfo('Pts', true), new StatInfo('PassYds'), new StatInfo('PassTDs'), new StatInfo('Pass2PC', false, true), new StatInfo('PassINTs'), 
             new StatInfo('RushYds'), new StatInfo('RushTDs'), new StatInfo('Rush2PC', false, true),
             new StatInfo('RecYds'), new StatInfo('RecTDs'), new StatInfo('Rec2PC', false, true), new StatInfo('Rec'), 
             new StatInfo('FumRecTD', false, true), new StatInfo('Fum'), new StatInfo('FL'),
             new StatInfo('KRetYds'), new StatInfo('PRetYds'), new StatInfo('KRetTD'), new StatInfo('PRetTD'), new StatInfo('FumRetTD')];

var StatValueOverrides = [];
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

module.exports = ScoringSummary;
'use strict';

/* MANUAL OVERRIDES (Until only one of the players is still active)

David Johnson <UNI> - RB Ari
David Johnson <Ark St> - TE Pit

Ryan Griffin <UConn> - TE Hou
Ryan Griffin <Tulane> - QB TB

Chris Thompson <FSU> - RB Wsh
Chris Thompson <Florida> - WR Hou

*/

const SPECIAL_CASES = require('./player-name-special-cases').PlayerNames;

/*
  <BDXMLPlayerList>
    <PlayerName first="Peyton" last="Manning" team="Den" pos="QB"/>
  </BDXMLPlayerList>
*/

const cheerio = require('cheerio');

const PlayerList = function () {
    this.players = [];
};

PlayerList.prototype.addPlayersFromHTML = function (html) {
    var $ = cheerio.load(html);

    $('#playertable_0 tr.pncPlayerRow td.playertablePlayerName').each(function (index, cell) {
        var info = $(cell).text()
            .replace(new RegExp(String.fromCharCode(160), 'g'), ' ')
            .replace(/\*/g, '');
        var parts = info.split(', ');

        var plyrNme = parts[0].trim()
            .replace(/'/g, '*');
        var infoParts = parts[1].trim()
            .replace(/\*/g, '').split(' ');
        var firstName = plyrNme.split(" ")[0];
        var lastName = plyrNme.substr((firstName.length + 1));
        var team = infoParts[0];
        var pos = infoParts[1];
        this.players.push(new Player(firstName, lastName, team, pos));
    }.bind(this));
}

PlayerList.prototype.toXML = function () {
    var parts = ['<BDXMLPlayerList>'];
    this.players.forEach(function (player) {
        parts.push(player.ToString());
    });
    parts.push('</BDXMLPlayerList>');
    return parts.join('\n');
}

const Player = function (sFirst, sLast, sTeam, sPos)
{
    const combined = `${sFirst} ${sLast}`;
    if (SPECIAL_CASES[combined]) {
        const matched = SPECIAL_CASES[combined];
        this.first = matched.first;
        this.last = matched.last;
        if (matched.suffix) {
            this.suffix = matched.suffix;
        }
        if (matched.identifier) {
            this.identifier = matched.identifier;
        }
    } else {
        this.first = sFirst;
        if (sLast.indexOf(' ') !== -1) {
            this.last = sLast.split(' ')[0];
            this.suffix = sLast.substr(this.last.length + 1);
        } else {
            this.last = sLast;
        }
    }
    this.team = sTeam;
    this.position = sPos;
}
Player.prototype =
{
    ToString: function ()
    {
        let dynamic = '';
        if (this.suffix) {
            dynamic += ` suffix="${this.suffix}"`;
        }
        if (this.identifier) {
            dynamic += ` id="${this.identifier}"`;
        }
        return `<PlayerName first="${this.first}" last="${this.last}"${dynamic} team="${this.team}" pos="${this.position}"/>`;
    }
}

module.exports = PlayerList;
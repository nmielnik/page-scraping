/* MANUAL OVERRIDES (Until only one of the players is still active)

David Johnson <UNI> - RB Ari
David Johnson <Ark St> - TE Pit

Ryan Griffin <UConn> - TE Hou
Ryan Griffin <Tulane> - QB TB

Chris Thompson <FSU> - RB Wsh
Chris Thompson <Florida> - WR Hou

*/

const SPECIAL_CASES = {
    'Antonio Brown': {
        first: 'Antonio',
        last: 'Brown',
        identifier: 'CMichigan'
    },
    'Adrian Peterson': {
        first: 'Adrian',
        last: 'Peterson',
        identifier: 'Oklahoma'
    },
    'Steve Smith Sr.': {
        first: 'Steve',
        last: 'Smith',
        suffix: 'Sr.',
        identifier: 'Utah'
    },
    'Zach Miller': {
        first: 'Zach',
        last: 'Miller',
        'identifier': 'NebOmaha'
    },
    'Mike Davis': {
        first: 'Mike',
        last: 'Davis',
        identifier: 'SC'
    },
    'Chris Givens': {
        first: 'Chris',
        last: 'Givens',
        identifier: 'Wake Forest'
    },
    'Ryan Grant': {
        first: 'Ryan',
        last: 'Grant',
        identifier: 'Tulane'
    },
    'Kevin Smith': {
        first: 'Kevin',
        last: 'Smith',
        identifier: 'Washington'
    },
    'Devin Lewis Fuller': {
        first: 'Devin Lewis',
        last: 'Fuller'
    },
    'Rico Darnell Gathers': {
        first: 'Rico Darnell',
        last: 'Gathers'
    },
    'Andre Jerome Caldwell': {
        first: 'Andre Jerome',
        last: 'Caldwell'
    },
    'Maurice Lynell Harris': {
        first: 'Maurice',
        last: 'Harris'
    },
    'Josh Javon Johnson': {
        first: 'Josh',
        last: 'Johnson'
    },
    'Charles D. Johnson': {
        first: 'Charles',
        last: 'Johnson'
    },
    'Alex Smith': {
        first: 'Alex',
        last: 'Smith',
        identifier: 'Utah'
    },
    'Michael Thomas': {
        first: 'Michael',
        last: 'Thomas',
        identifier: 'Ohio St'
    },
    'Mike Williams': {
        first: 'Mike',
        last: 'Williams',
        identifier: 'Clemson'
    },
    'Chris Harper': {
        first: 'Chris',
        last: 'Harper',
        identifier: 'Cal'
    },
    'Equanimeous St. Brown': {
        first: 'Equanimeous',
        last: 'St. Brown'
    },
    'Todd Gurley': {
        first: 'Todd',
        last: 'Gurley',
        suffix: 'II'
    },
    'Mark Ingram': {
        first: 'Mark',
        last: 'Ingram',
        suffix: 'II'
    },
    'Michael Thomas': {
        first: 'Michael',
        last: 'Thomas',
        identifier: 'Ohio St'
    },
    'Mitch Trubisky': {
        first: 'Mitchell',
        last: 'Trubisky'
    },
    'Duke Johnson': {
        first: 'Duke',
        last: 'Johnson',
        suffix: 'Jr.'
    },
    'D.J. Moore': {
        first: 'DJ',
        last: 'Moore'
    },
    'AJ Green': {
        first: 'A.J.',
        last: 'Green'
    },
    'David Johnson': {
        first: 'David',
        last: 'Johnson',
        identifier: 'UNI'
    },
    'Mike Williams': {
        first: 'Mike',
        last: 'Williams',
        identifier: 'Clemson'
    },
    'Odell Beckham Jr': {
        first: 'Odell',
        last: 'Beckham',
        suffix: 'Jr.'
    },
    'Will Fuller': {
        first: 'Will',
        last: 'Fuller',
        suffix: 'V'
    },
    'Marvin Jones': {
        first: 'Marvin',
        last: 'Jones',
        suffix: 'Jr.'
    },
    'OJ Howard': {
        first: 'O.J.',
        last: 'Howard'
    },
    'Ted Ginn': {
        first: 'Ted',
        last: 'Ginn',
        suffix: 'Jr.'
    },
    'Adrian Peterson': {
        first: 'Adrian',
        last: 'Peterson',
        identifier: 'Oklahoma'
    },
    'CJ Anderson': {
        first: 'C.J.',
        last: 'Anderson'
    },
    'D.K. Metcalf': {
        first: 'DK',
        last: 'Metcalf'
    },
    'Darrell Henderson': {
        first: 'Darrell',
        last: 'Henderson',
        suffix: 'Jr.'
    },
    'Chris Herndon IV': {
        first: 'Chris',
        last: 'Herndon'
    },
    'JJ Arcega-Whiteside': {
        first: 'J.J.',
        last: 'Arcega-Whiteside'
    }
};

var fullNameFormat = function(plyr) {
    var fullname = `${plyr.first} ${plyr.last}`;
    if (plyr.suffix)
        fullname = `${fullname} ${plyr.suffix}`;
    if (plyr.identifier)
        fullname = `${fullname} <${plyr.identifier}>`;
    return fullname;
}

module.exports = {
    PlayerNames: SPECIAL_CASES,
    fullNameFormat: fullNameFormat
};
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
    /*
    'Mike Davis': {
        first: 'Mike',
        last: 'Davis',
        identifier: 'SC'
    },*/
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
    'Mark Ingram II': {
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
    'D.J. Chark': {
        first: 'DJ',
        last: 'Chark',
        suffix: 'Jr.'
    },
    'DJ Chark Jr.': {
        first: 'DJ',
        last: 'Chark',
        suffix: 'Jr.'
    },
    'DJ Chark': {
        first: 'DJ',
        last: 'Chark',
        suffix: 'Jr.'
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
    'Odell Beckham Jr.': {
        first: 'Odell',
        last: 'Beckham',
        suffix: 'Jr.'
    },
    'Odell Beckham': {
        first: 'Odell',
        last: 'Beckham',
        suffix: 'Jr.'
    },
    'Will Fuller': {
        first: 'William',
        last: 'Fuller',
        suffix: 'V'
    },
    'William Fuller': {
        first: 'William',
        last: 'Fuller',
        suffix: 'V'
    },
    'William Fuller V': {
        first: 'William',
        last: 'Fuller',
        suffix: 'V'
    },
    'Marvin Jones': {
        first: 'Marvin',
        last: 'Jones',
        suffix: 'Jr.'
    },
    'Marvin Jones Jr.': {
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
    'Darrell Henderson Jr.': {
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
    },
    'A.J. Dillon': {
        first: 'AJ',
        last: 'Dillon'
    },
    'K.J. Hamler': {
        first: 'KJ',
        last: 'Hamler'
    },
    'Amon-Ra St. Brown': {
        first: 'Amon-Ra',
        last: 'St. Brown'
    },
    'Ronald Jones': {
        first: 'Ronald',
        last: 'Jones',
        suffix: 'II'
    },
    'Tony Jones': {
        first: 'Tony',
        last: 'Jones',
        suffix: 'Jr.'
    },
    'Irv Smith Jr.': {
        first: 'Irv',
        last: 'Smith',
        suffix: 'Jr.'
    },
    'Laviska Shenault Jr.': {
        first: 'Laviska',
        last: 'Shenault',
        suffix: 'Jr.'
    },
    'Henry Ruggs III': {
        first: 'Henry',
        last: 'Ruggs',
        suffix: 'III'
    },
    'Terrace Marshall Jr.': {
        first: 'Terrace',
        last: 'Marshall',
        suffix: 'Jr.'
    },
    'Tony Jones Jr.': {
        first: 'Tony',
        last: 'Jones',
        suffix: 'Jr.'
    },
    'Jeff Wilson Jr.': {
        first: 'Jeff',
        last: 'Wilson',
        suffix: 'Jr.'
    },
    'Jeff Wilson': {
        first: 'Jeff',
        last: 'Wilson',
        suffix: 'Jr.'
    },
    'Robby Anderson': {
        first: 'Robbie',
        last: 'Anderson'
    },
    'Kenneth Walker': {
        first: 'Kenneth',
        last: 'Walker',
        suffix: 'III'
    },
    'John Metchie': {
        first: 'John',
        last: 'Metchie',
        suffix: 'III'
    },
    'Michael Pittman': {
        first: 'Michael',
        last: 'Pittman',
        suffix: 'Jr.'
    },
    'Brian Robinson Jr.': {
        first: 'Brian',
        last: 'Robinson',
        suffix: 'Jr.'
    },
    'Brian Robinson': {
        first: 'Brian',
        last: 'Robinson',
        suffix: 'Jr.'
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
var primitiveRoot = require('./primitive_root.js');

var rn = require('random-number');
var options = {
    min: 0
    , max: 100
    , integer: true
};
const a = rn(options);
var g = 0;
var bits = 18;
var forge = require('node-forge')
var p = 0;
var A = 0;
var key = "";
forge.prime.generateProbablePrime(bits, function (err, num) {
    console.log('random prime', num.toString(10));
    p = parseInt(num.toString(10));
    g = primitiveRoot(p);
    A = raise(g, a, p);
    // A = Math.pow(g, a) % p;
    console.log("Diffie-Hellman: " + JSON.stringify({
        a: a,
        p: p,
        g: g,
        A: A
    }));
});

var lettersMap = {
    "а": "1",
    "и": "2",
    "т": "3",
    "е": "4",
    "с": "5",
    "н": "6",
    "о": "7",
    "б": "81",
    "в": "82",
    "г": "83",
    "д": "84",
    "ж": "85",
    "з": "86",
    "к": "87",
    "л": "88",
    "м": "89",
    "п": "80",
    "р": "91",
    "у": "92",
    "ф": "93",
    "х": "94",
    "ц": "95",
    "ч": "96",
    "ш": "97",
    "щ": "98",
    "ъ": "99",
    "ы": "90",
    "ь": "01",
    "э": "02",
    "ю": "03",
    "я": "04",
    " ": "00"
};

var reverseLettersMap = {
    "1": "а",
    "2": "и",
    "3": "т",
    "4": "е",
    "5": "с",
    "6": "н",
    "7": "о",
    "81": "б",
    "82": "в",
    "83": "г",
    "84": "д",
    "85": "ж",
    "86": "з",
    "87": "к",
    "88": "л",
    "89": "м",
    "80": "п",
    "91": "р",
    "92": "у",
    "93": "ф",
    "94": "х",
    "95": "ц",
    "96": "ч",
    "97": "ш",
    "98": "щ",
    "99": "ъ",
    "90": "ы",
    "01": "ь",
    "02": "э",
    "03": "ю",
    "04": "я",
    "00": " "
};


var keyText = "вилофывлыфорволыфлврлфыорвлдфырадлыфралыфрадлыфокрйдоцлркатилроцратиулраорйцилсотрскрпркмпрокпуцйорвийоураомцйрвмцлрвмйцрвмлйцрмвлрчомбонрбцойвнарвибойцчм";

var keyStartIndex = 0;
var keyLength = 3;

function initialKeySend() {
    return {
        g: g,
        p: p,
        A: A
    }
}

function calculateKey(B) {
    console.log("received B: " + B + " a : " + a);
    key = "" + raise(B, a, p);
    console.log("Calculated key: " + key)
}

function encrypt(message) {

    // var key = keyText.substring(keyStartIndex, keyStartIndex + keyLength + 1);
    // console.log("Key for encrypting:" + key);
    // if (key.length > message.length) {
    //     key = key.substring(0, message.length + 1);
    // }
    var transformedMessage = transformToNumbers(message);
    // var transformedKey = transformToNumbers(key);
    var transformedKey = key;
    var extendedKey = extendKey(transformedKey, transformedMessage);

    var encryptedMessage = "";
    for (var i = 0; i < transformedMessage.length; i++) {
        var messageNumber = parseInt(transformedMessage.charAt(i));
        var keyNumber = parseInt(extendedKey.charAt(i));
        encryptedMessage += "" + ((messageNumber + keyNumber) % 10)
    }
    return encryptedMessage;
}


function transformToNumbers(text) {
    var transformed = "";
    for (var i = 0; i < text.length; i++) {
        transformed += lettersMap[text.charAt(i)];
    }
    return transformed;
}

function extendKey(transformedKey, transformedMessage) {
    var extendedKey = transformedKey;
    if (transformedKey.length !== transformedMessage.length) {
        extendedKey = "";
        var rest = transformedMessage.length % transformedKey.length;
        while (extendedKey.length < transformedMessage.length) {
            if (extendedKey.length + transformedKey.length > transformedMessage.length) {
                break;
            } else {
                extendedKey += transformedKey;
            }
        }
        if (rest > 0) {
            for (var i = 0; i < rest; i++) {
                extendedKey += '0';
            }
        }
    }
    return extendedKey;
}

function decrypt(message) {
    // var key = keyText.substring(keyStartIndex, keyStartIndex + keyLength + 1);
    // var transformedKey = transformToNumbers(key);
    var transformedKey = key;
    var extendedKey = extendKey(transformedKey, message);

    var decryptedMessage = "";
    for (var i = 0; i < message.length; i++) {
        var messageNumber = parseInt(message.charAt(i));
        var keyNumber = parseInt(extendedKey.charAt(i));
        decryptedMessage += "" + ((messageNumber + 10 - keyNumber) % 10)
    }

    var messageAsLetters = "";

    for (var n = 0; n < decryptedMessage.length; n++) {
        var id = decryptedMessage.charAt(n);
        if (parseInt(id) < 8 && parseInt(id) > 0) {
            messageAsLetters += reverseLettersMap[id];
        } else {
            id += decryptedMessage.charAt(n + 1);
            messageAsLetters += reverseLettersMap[id];
            n++;
        }
    }
    return messageAsLetters;
}

function raise(value, power, modulo) {
    var result = 1;
    for (var i = 0; i < power; i++) {
        var multiplier = result * value;
        result = multiplier % modulo
    }
    return result;
}

// function getLetterFromNumber(number) {
//     var letterToReturn = " ";
//     lettersMap.forEach(letter => {
//         if (number === lettersMap[letter]) {
//             letterToReturn = letter;
//         }
//     });
//     return letterToReturn;
// }

module.exports = {encrypt, decrypt, keyStartIndex, keyLength, initialKeySend, calculateKey};
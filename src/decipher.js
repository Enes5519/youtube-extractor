const fetch = require('node-fetch');
const baseURL = 'https://www.youtube.com';
const videoPageURL = baseURL + '/watch?v=';

function decipherPlayerFunctions(player_response) {
    const regex = player_response.match(/var \w+={(\w+:function\(.*?)}};/s)[1];
    const result = {};
    regex.split('},').forEach((value) => {
        const temp = value.trim().split(':');
        result[temp[0]] = temp[1].match(/[{](.*)/)[1];
    });
    return result;
};

function decipherPattern(str) {
    const match = str.match(/(.*?)\(a,(.*?)\)/);
    return { function: match[1], number: parseInt(match[2]) };
};

function decipherPlayerPatterns(deChip) {
    const result = [];
    for (const value of deChip.matchAll(/.(\w+\(\w+,\d+\))/g)) {
        result.push(decipherPattern(value[1]));
    }
    return result;
};

async function decipher(video_id, cipher){
    try {
        let playerPage = await fetch(videoPageURL + video_id);
        if (playerPage.status !== 200) {
            return 'error';
        }
        playerPage = await playerPage.text();
        const player = await fetch(baseURL + playerPage.match(/jsUrl":"(.*?)"/)[1]);
        const playerResponse = await player.text();
        const dechiperFunction = playerResponse.match(/a[.]split[(]""[)];(.*);return a[.]join[(]""[)]/)[1];
        const functions = decipherPlayerFunctions(playerResponse);
        const patterns = decipherPlayerPatterns(dechiperFunction);

        let signature = cipher.s.split('');
        patterns.forEach((pattern) => {
            switch (functions[pattern.function]) {
                case 'a.reverse()':
                    signature = signature.reverse();
                    break;
                case 'var c=a[0];a[0]=a[b%a.length];a[b%a.length]=c':
                    let c = signature[0];
                    signature[0] = signature[pattern.number % signature.length];
                    signature[pattern.number % signature.length] = c;
                    break;
                case 'a.splice(0,b)':
                    signature = signature.splice(pattern.number);
                    break;
            }
        });

        return signature.join('');
    } catch (e) {
        console.log('Failed fetch', e);

        return 'error';
    }
}

module.exports = decipher;
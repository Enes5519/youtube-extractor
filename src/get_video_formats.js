const fetch = require('node-fetch');
const VideoFormat = require('./video_format');
const decodeJSONFromQuery = require('./decode_json_from_query');
const videoDetailsBaseURL =
  'https://www.youtube.com/get_video_info?&asv=3&el=detailpage&hl=en_US&video_id=';

async function getVideoFormats(video_id) {
  const response = await fetch(videoDetailsBaseURL + video_id);
  if (response.status !== 200) return null;

  try {
    const html = await response.text();
    const player_response = JSON.parse(decodeJSONFromQuery(html)['player_response']);
    const adaptiveFormats = player_response['streamingData']['adaptiveFormats'];

    if (adaptiveFormats.length !== 0) {
      return adaptiveFormats.map((format) => {
        const hasCipher = Boolean(format.signatureCipher);
        return new VideoFormat(
          hasCipher,
          hasCipher ? decodeJSONFromQuery(format.signatureCipher) : format.url,
          format.mimeType,
          video_id,
          format.bitrate
        );
      });
    }

    return null;
  } catch (e) {
    console.log('Fetch error', e);

    return null;
  }
}

module.exports = getVideoFormats;

const fetch = require('node-fetch');

const REGEX_ONE = /ytInitialData[^{]*(.*"adSafetyReason":[^;]*});/s;
const REGEX_TWO = /ytInitialData"[^{]*(.*);\s*window\["ytInitialPlayerResponse"\]/s;

const getVideoList = async (keyword) => {
  try {
    const response = await fetch(
      'https://www.youtube.com/results?q=' + encodeURIComponent(keyword)
    );
    if (response.status !== 200) return [];

    const html = await response.text();

    let match = html.match(REGEX_ONE);
    if (!match || match.length <= 1) {
      match = html.match(REGEX_TWO);
    }

    const data = JSON.parse(match[1]);
    return parseJsonFormat(
      data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents
    );
  } catch (ex) {
    console.error('Failed to parse data:', ex);
  }

  return [];
};

const parseJsonFormat = (contents) => {
  const results = [];
  contents.forEach((sectionList) => {
    if (sectionList.hasOwnProperty('itemSectionRenderer')) {
      sectionList.itemSectionRenderer.contents.forEach((content) => {
        if (content.hasOwnProperty('videoRenderer') && content.videoRenderer.lengthText) {
          results.push(parseVideoRenderer(content.videoRenderer));
        }
      });
    }
  });
  return results;
};

const parseVideoRenderer = (renderer) => {
  return {
    id: renderer.videoId,
    title: renderer.title.runs.reduce(titleReduce, ''),
    url:
      'https://www.youtube.com' +
      renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url,
    duration: renderer.lengthText.simpleText,
    thumbnail: renderer.thumbnail.thumbnails[renderer.thumbnail.thumbnails.length - 1].url,
    author: renderer.ownerText.runs[0].text,
  };
};

const titleReduce = (a, b) => a + b.text;

module.exports = getVideoList;

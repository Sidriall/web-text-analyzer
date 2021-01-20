'use strict';
const { fromUrl } = require('textract');
const { promisify } = require('util');

const textExtractor = async (url) => {
  return promisify(fromUrl)(url);
};

const wordsExtractor = ({ text, wordLength }) =>
  text
    .match(/\w+/g)
    .filter((word) => word.length > wordLength)
    .reduce((accumulator, word) => {
      const alreadyExist = accumulator.find((element) => element.word === word);
      if (alreadyExist) {
        alreadyExist.count++;
      } else {
        accumulator.push({ word, count: 1 });
      }

      return accumulator;
    }, [])
    .sort((a, b) => b.count - a.count);

module.exports = {
  textExtractor,
  wordsExtractor,
};

// text analyzer
'use strict';
const Joi = require('joi');
const { textExtractor, wordsExtractor } = require('../../libs/text');
const { generatePdf } = require('../../libs/pdf');

const handler = async (request, h) => {
  const { urls } = request.payload;

  // more parameters that can be customized in the future
  const neededWords = 3;
  const wordLength = 4;

  const body = []; // body of the pdf document

  for (const url of urls) {
    const row = []; // table row of the pdf document

    try {
      // get text from the html
      const text = await textExtractor(url);

      // get most popular words that are longer than 4 letters
      const words = wordsExtractor({ text, wordLength });

      const result = [];
      for (let index = 0; index < neededWords; index++) {
        result.push(words[index].word || '');
      }

      row.push(url, ...result);
      body.push(row);
    } catch (error) {
      request.server.logger.error(error.message, 'post /analyze');
    }
  }

  // // generating pdf
  const pdf = generatePdf({ body, neededWords });

  // sending pdf
  return h.file(`./${pdf}`, {
    mode: 'attachment',
    type: 'application/pdf',
  });
};

module.exports = {
  method: 'POST',

  path: '/analyze',

  handler,

  options: {
    // validation - string[]
    validate: {
      payload: Joi.object({
        urls: Joi.array()
          .items(
            Joi.string().pattern(
              /^(https?:\/\/)?([\w\.]+)\.([a-z]{2,6}\.?)(\/[\w\.]*)*\/?$/ // url pattern
              // /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/ // other url pattern
            )
          )
          .min(1)
          .required(),
      }),
    },
  },
};

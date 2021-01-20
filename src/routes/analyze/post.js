// text analyzer
'use strict';
const Joi = require('joi');
const { fromUrl } = require('textract');
const { promisify } = require('util');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

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
      const text = await promisify(fromUrl)(url);

      // get most popular words that are longer than 4 letters
      const words = text
        .match(/\w+/g)
        .filter((word) => word.length > wordLength)
        .reduce((accumulator, word) => {
          const alreadyExist = accumulator.find(
            (element) => element.word === word
          );
          if (alreadyExist) {
            alreadyExist.count++;
          } else {
            accumulator.push({ word, count: 1 });
          }

          return accumulator;
        }, [])
        .sort((a, b) => b.count - a.count);

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

  // generating pdf
  const doc = new jsPDF();

  const columnsNames = [];
  for (let columnName = 1; columnName <= neededWords; columnName++) {
    columnsNames.push(columnName.toString());
  }

  doc.autoTable({
    head: [['Web Address', ...columnsNames]],
    body,
  });

  // saving pdf
  const filename = 'test.pdf';
  doc.save(filename);

  // sending pdf
  return h.file(`./${filename}`, {
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

'use strict';
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const generatePdf = ({ body, neededWords }) => {
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

  return filename;
};

module.exports = {
  generatePdf,
};

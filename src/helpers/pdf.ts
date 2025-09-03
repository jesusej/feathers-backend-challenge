/**
 * PDF generation utilities for currency conversion reports
 * @module pdf
 */
import PdfMake from 'pdfmake';
import { TDocumentDefinitions, Content, Style, TableCell } from 'pdfmake/interfaces';
import { IConversion } from '../models/conversion.model';
import { Readable } from 'stream';
import { join } from 'path';

/**
 * Font configuration for PDF generation
 */
const fonts = {
  Roboto: {
    normal: join(__dirname, '../../node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf'),
    bold: join(__dirname, '../../node_modules/roboto-font/fonts/Roboto/roboto-medium-webfont.ttf'),
    italics: join(__dirname, '../../node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf'),
    bolditalics: join(__dirname, '../../node_modules/roboto-font/fonts/Roboto/roboto-mediumitalic-webfont.ttf')
  }
};

/**
 * Default styles for PDF documents
 */
const defaultStyles: Record<string, Style> = {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 10]
  },
  subheader: {
    fontSize: 14,
    bold: true,
    margin: [0, 10, 0, 5]
  },
  tableHeader: {
    bold: true,
    fontSize: 12,
    color: 'black'
  },
  timestamp: {
    fontSize: 10,
    italics: true,
    margin: [0, 5, 0, 10]
  }
};

/**
 * Creates the table layout for conversion records
 * @param conversions - Array of conversion records
 * @returns Table content for PDF generation
 */
function createConversionTable(conversions: IConversion[]): Content {
  const tableBody: TableCell[][] = [
    [
      { text: 'From', style: 'tableHeader' },
      { text: 'To', style: 'tableHeader' },
      { text: 'Amount', style: 'tableHeader' },
      { text: 'Result', style: 'tableHeader' },
      { text: 'Time', style: 'tableHeader' }
    ]
  ];

  conversions.forEach(conv => {
    tableBody.push([
      conv.from,
      conv.to,
      conv.amount.toFixed(2),
      conv.result.toFixed(2),
      new Date(conv.timestamp).toLocaleTimeString()
    ]);
  });

  return {
    table: {
      headerRows: 1,
      widths: ['auto', 'auto', '*', '*', '*'],
      body: tableBody
    }
  };
}

/**
 * Creates a PDF document definition for conversion records
 * @param conversions - Array of conversion records
 * @returns PDF document definition
 */
function createDocumentDefinition(
  conversions: IConversion[],
): TDocumentDefinitions {
  const timestamp = new Date().toUTCString();
  
  const content: Content[] = [
    { text: 'Currency Conversion Report', style: 'header' },
    { text: `Generated on: ${timestamp}`, style: 'timestamp' },
    { text: 'Conversion Details', style: 'subheader' },
    createConversionTable(conversions)
  ]

  return {
    content,
    styles: defaultStyles,
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

/**
 * Generates a PDF report from conversion records
 * @param conversions - Array of conversion records
 * @returns Readable stream of the generated PDF
 * @throws {Error} If PDF generation fails
 */
export function generateConversionReport(
  conversions: IConversion[]
): Readable {
  try {
    const printer = new PdfMake(fonts);
    const docDefinition = createDocumentDefinition(conversions);
    
    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    pdfDoc.end()

    return Readable.from(pdfDoc)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to generate PDF report: ${errorMessage}`);
  }
}

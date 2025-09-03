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
 * Options for customizing the conversion report
 */
export interface ConversionReportOptions {
  title?: string;
  showTimestamp?: boolean;
  groupByCurrency?: boolean;
}

/**
 * Statistics about currency conversions
 */
interface ConversionStats {
  totalConversions: number;
  uniqueCurrencies: Set<string>;
  totalAmountConverted: number;
}

/**
 * Calculates statistics from a list of conversions
 * @param conversions - Array of conversion records
 * @returns Statistics about the conversions
 */
function calculateStats(conversions: IConversion[]): ConversionStats {
  return conversions.reduce((stats, conv) => {
    stats.totalConversions++;
    stats.uniqueCurrencies.add(conv.from).add(conv.to);
    stats.totalAmountConverted += conv.amount;
    return stats;
  }, {
    totalConversions: 0,
    uniqueCurrencies: new Set<string>(),
    totalAmountConverted: 0
  });
}

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
      widths: ['*', '*', 'auto', 'auto', 'auto'],
      body: tableBody
    }
  };
}

/**
 * Creates a PDF document definition for conversion records
 * @param conversions - Array of conversion records
 * @param options - Options for customizing the report
 * @returns PDF document definition
 */
function createDocumentDefinition(
  conversions: IConversion[],
  options: ConversionReportOptions = {}
): TDocumentDefinitions {
  const stats = calculateStats(conversions);
  const timestamp = new Date().toLocaleString();
  
  const content: Content[] = [
    { text: options.title || 'Currency Conversion Report', style: 'header' }
  ];

  if (options.showTimestamp) {
    content.push({ text: `Generated on: ${timestamp}`, style: 'timestamp' });
  }

  content.push(
    { text: 'Summary', style: 'subheader' },
    {
      ul: [
        `Total Conversions: ${stats.totalConversions}`,
        `Unique Currencies: ${stats.uniqueCurrencies.size}`,
        `Total Amount Converted: ${stats.totalAmountConverted.toFixed(2)}`
      ]
    },
    { text: 'Conversion Details', style: 'subheader' },
    createConversionTable(conversions)
  );

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
 * @param options - Options for customizing the report
 * @returns Readable stream of the generated PDF
 * @throws {Error} If PDF generation fails
 */
export function generateConversionReport(
  conversions: IConversion[],
  options?: ConversionReportOptions
): Readable {
  try {
    const printer = new PdfMake(fonts);
    const docDefinition = createDocumentDefinition(conversions, options);
    
    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    pdfDoc.end()

    return Readable.from(pdfDoc)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to generate PDF report: ${errorMessage}`);
  }
}

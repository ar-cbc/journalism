import process from "node:process";

import { JWT } from "npm:google-auth-library@9";
import {
  GoogleSpreadsheet,
  type GoogleSpreadsheetWorksheet,
} from "npm:google-spreadsheet@4";

/**
 * Authenticates with Google Sheets and returns a worksheet object.
 * @param sheetUrl The URL of the Google Sheet.
 * @param options Optional authentication options.
 * @returns A GoogleSpreadsheetWorksheet object.
 */
export default async function logToSheet(
  sheetUrl: string,
  options: { apiEmail?: string; apiKey?: string } = {},
) {
  const urlItems = sheetUrl.split("/");
  const spreadsheetId = urlItems[5];
  const sheetId = urlItems[6].split("=")[1];

  const emailVar = options.apiEmail ?? "GOOGLE_SERVICE_ACCOUNT_EMAIL";
  const keyVar = options.apiKey ?? "GOOGLE_PRIVATE_KEY";
  const email = process.env[emailVar];
  const key = process.env[keyVar];

  if (email === undefined || email === "") {
    throw new Error(`process.env.${emailVar} is undefined or ''.`);
  }
  if (key === undefined || key === "") {
    throw new Error(`process.env.${keyVar} is undefined or ''.`);
  }

  const jwt = new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const spreadsheet = new GoogleSpreadsheet(spreadsheetId, jwt);

  await spreadsheet.loadInfo();

  // @ts-expect-error sheetId is a string, but indexes are number?
  const sheet = spreadsheet.sheetsById[sheetId];

  if (sheet === undefined) {
    throw new Error(
      `Sheet with ID ${sheetId} not found. Make sure the sheet URL ends with just one gid=ID.`,
    );
  }

  return sheet as GoogleSpreadsheetWorksheet;
}

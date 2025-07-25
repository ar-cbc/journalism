import { max, min, type Numeric } from "npm:d3-array@3";
import getColors from "./getColors.ts";
import drawChart from "./drawChart.ts";
import validateDataTypes from "./validateDataTypes.ts";
import formatDate from "../../format/formatDate.ts";
import formatNumber from "../../format/formatNumber.ts";

export default function prepChart(
  type: "line" | "dot",
  data: { [key: string]: unknown }[],
  x: string,
  y: string,
  drawFunction: (
    data: { [key: string]: unknown }[],
    y: string,
    yMin: number,
    yMax: number,
    color: string,
    chartData: string[][],
    options: {
      width: number;
      height: number;
    },
  ) => void,
  options: {
    formatX?: (d: unknown) => string;
    formatY?: (d: unknown) => string;
    smallMultiples?: string;
    fixedScales?: boolean;
    smallMultiplesPerRow?: number;
    width?: number;
    height?: number;
  } = {},
) {
  validateDataTypes(data, x, y);

  const formatX = options.formatX
    ? options.formatX
    : data[0][x] instanceof Date
    ? (d: unknown) => formatDate(d as Date, "YYYY-MM-DD", { utc: true })
    : function (d: unknown) {
      return String(d);
    };
  const formatY = options.formatY
    ? options.formatY
    : (d: unknown) => formatNumber(d as number);

  const width = options.width ?? 75;
  const height = options.height ?? 15;
  const smallMultiplesPerRow = options.smallMultiplesPerRow ?? 2;
  const smallMultiples = options.smallMultiples ?? null;
  const fixedScales = options.fixedScales ?? false;

  if (typeof smallMultiples === "string") {
    const categories = Array.from(
      new Set(data.map((d) => d[smallMultiples])),
    ) as string[];
    const colors = getColors(categories);

    const allLabelsX: string[] = [];

    let xMin: number;
    let xMax: number;
    let yMin: number;
    let yMax: number;

    // min and max values for the whole data
    if (fixedScales) {
      const xValues = data.map((d) => {
        const val = d[x];
        return val instanceof Date ? val.getTime() : val as number;
      });
      xMin = min(xValues as Numeric[]) as number;
      xMax = max(xValues as Numeric[]) as number;

      const yValues = data.map((d) => d[y] as number);
      yMin = min(yValues as Numeric[]) as number;
      yMax = max(yValues as Numeric[]) as number;

      if (
        xMin === undefined ||
        xMax === undefined ||
        yMin === undefined ||
        yMax === undefined
      ) {
        throw new Error("The min or max value is undefined.");
      }
    }

    if (data.length > Math.round(width / smallMultiplesPerRow)) {
      if (type === "line") {
        console.log(
          "\x1b[2m\n/!\\ Number of values greater than width. Averaged values displayed.\x1b[0m",
        );
      } else if (type === "dot") {
        console.log(
          "\x1b[2m\n/!\\ Number of values greater than width. Dots might overlap.\x1b[0m",
        );
      }
    }

    const allCharts = colors?.map((c) => {
      const dataFiltered = data.filter(
        (d) => d[smallMultiples] === c.category,
      );

      // The min and max values for each small multiple
      if (!fixedScales) {
        const xValues = dataFiltered.map((d) => {
          const val = d[x];
          return val instanceof Date ? val.getTime() : val as number;
        });
        xMin = min(xValues as Numeric[]) as number;
        xMax = max(xValues as Numeric[]) as number;

        const yValues = dataFiltered.map((d) => d[y] as number);
        yMin = min(yValues as Numeric[]) as number;
        yMax = max(yValues as Numeric[]) as number;
      }

      const { chart, xLabels } = drawChart(
        type,
        drawFunction,
        dataFiltered,
        x,
        y,
        c.color,
        {
          title: c.category,
          width: Math.round(width / smallMultiplesPerRow),
          height: height,
          formatX: formatX,
          formatY: formatY,
          xMin,
          xMax,
          yMin,
          yMax,
        },
      );
      allLabelsX.push(...xLabels);
      return chart;
    });

    if (allCharts === undefined) {
      throw new Error("No data to display.");
    }

    // Restructure the charts to make small multiples on multiple columns
    const allChartsRows: string[][] = [];
    for (let i = 0; i < allCharts.length; i += smallMultiplesPerRow) {
      const charts = allCharts.slice(i, i + smallMultiplesPerRow);
      const combinedRows: string[][] = [];
      for (let j = 0; j < charts.length; j++) {
        if (j === 0) {
          combinedRows.push(...charts[j]);
        } else {
          for (let k = 0; k < charts[j].length; k++) {
            combinedRows[k].push(" ".repeat(3), ...charts[j][k]);
          }
        }
      }
      allChartsRows.push(...combinedRows);
      allChartsRows.push(" ".repeat(combinedRows[0].length).split(""));
    }

    let chartString = allChartsRows.map((d) => d.join("")).join("\n");

    const allLabelsXUnique = Array.from(new Set(allLabelsX));
    for (let i = 0; i < allLabelsXUnique.length; i++) {
      const regex = new RegExp(allLabelsXUnique[i], "g");
      chartString = chartString.replace(
        regex,
        `\x1b[90m${allLabelsXUnique[i]}\x1b[0m`,
      );
    }

    console.log(`\n${chartString}\n`);
  } else {
    const xValues = data.map((d) => {
      const val = d[x];
      return val instanceof Date ? val.getTime() : val as number;
    });
    const xMin = min(xValues as Numeric[]) as number;
    const xMax = max(xValues as Numeric[]) as number;

    const yValues = data.map((d) => d[y] as number);
    const yMin = min(yValues as Numeric[]) as number;
    const yMax = max(yValues as Numeric[]) as number;

    if (
      xMin === undefined ||
      xMax === undefined ||
      yMin === undefined ||
      yMax === undefined
    ) {
      throw new Error("The min or max value is undefined.");
    }

    if (data.length > width) {
      if (type === "line") {
        console.log(
          "\x1b[2m\n/!\\ Number of values greater than width. Averaged values displayed.\x1b[0m",
        );
      } else if (type === "dot") {
        console.log(
          "\x1b[2m\n/!\\ Number of values greater than width. Dots might overlap.\x1b[0m",
        );
      }
    }

    const { chart, xLabels } = drawChart(
      type,
      drawFunction,
      data,
      x,
      y,
      "\x1b[38;5;208m",
      {
        formatX: formatX,
        formatY: formatY,
        width: width,
        height: height,
        xMin,
        xMax,
        yMin,
        yMax,
      },
    );

    let chartString = chart.map((d) => d.join("")).join("\n");

    const allLabelsXUnique = Array.from(new Set(xLabels));
    for (let i = 0; i < allLabelsXUnique.length; i++) {
      const regex = new RegExp(allLabelsXUnique[i], "g");
      chartString = chartString.replace(
        regex,
        `\x1b[90m${allLabelsXUnique[i]}\x1b[0m`,
      );
    }

    console.log(`${chartString}`);
  }
}

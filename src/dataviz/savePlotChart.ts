import puppeteer from "puppeteer"
import { Plot } from "@observablehq/plot"

export default async function savePlotChart(
    data: { [key: string]: unknown }[],
    makeChart: (
        data: { [key: string]: unknown }[]
    ) => (SVGSVGElement | HTMLElement) & Plot,
    path: string
) {
    // We check which keys hold dates, based on the first data item.
    const keysWithDates = Object.keys(data[0]).filter(
        (key) => data[0][key] instanceof Date
    )
    // And we convert the dates to ms in the data. They will be easier to convert back to dates this way.
    if (keysWithDates.length > 0) {
        for (const d of data) {
            for (const key of keysWithDates) {
                d[key] = (d[key] as Date).getTime()
            }
        }
    }

    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()
    // For better screenshot resolution
    page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 2 })

    // We inject the d3 and plot code.
    await page.addScriptTag({
        path: "node_modules/d3/dist/d3.js",
    })
    await page.addScriptTag({
        path: "node_modules/@observablehq/plot/dist/plot.umd.js",
    })

    // We create an empty div.
    await page.setContent("<div id='dataviz' style='display:flex;'></div>")

    // We convert back dates, generate the chart and append it to our div.
    await page.evaluate(`
        const data = ${JSON.stringify(data)}
        const keysWithDates = ${JSON.stringify(keysWithDates)}
        for (const key of keysWithDates) {
            for (const d of data) {
                d[key] = new Date(d[key])
            }
        }
        const makeChart = ${makeChart.toString()}
        const plot = makeChart(data)
        const div = document.querySelector("#dataviz")
        if (!div) {
            throw new Error("No div with id dataviz")
        }
        div.append(plot)`)

    // We select the generated figure or svg and save a screenshot of it.
    const dataviz = await page.$("#dataviz > figure, #dataviz > svg")
    if (!dataviz) {
        throw new Error("No dataviz element.")
    }
    await dataviz.screenshot({ path })
    await browser.close()
}

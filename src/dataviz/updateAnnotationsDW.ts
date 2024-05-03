/**
 * Updates annotations in on a chart.
 *
 * ```js
 * import { updateAnnotationsDW } from "journalism"
 *
 * const chartID = "myChartId"
 * const apiKey = "myApiKey"
 * const myAnnotations = [
    {
        "x": "2024/08/30 01:52",
        "y": "14496235",
        "text": "This is an annotation!",
    },
    {
        "x": "2024/06/29",
        "y": "15035128",
        "dy": 50,
        "text": "This is also some text, but with an arrow!",
        "connectorLine": {
            "enabled": true,
            "type": "straight",
            "arrowHead": "lines"
        },
        "mobileFallback": false
    }
]
 *
 * await updateAnnotationsDW(chartID, apiKey, myAnnotations)
 * ```
 *
 * @category Dataviz
 */
export default async function updateAnnotationsDW(
    chartId: string,
    apiKey: string,
    annotations: {
        x: string
        y: string
        bg?: boolean
        dx?: number
        dy?: number
        bold?: boolean
        size?: number
        text: string
        align?: "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br"
        color?: string
        width?: number
        italic?: boolean
        underline?: boolean
        showMobile?: boolean
        showDesktop?: boolean
        connectorLine?: {
            type?: "straight" | "curveRight" | "curveLeft"
            circle?: boolean
            stroke?: 1 | 2 | 3
            enabled?: boolean
            arrowHead?: "lines" | "triangle" | false
            circleStyle?: string
            circleRadius?: number
            inheritColor?: boolean
            targetPadding?: number
        }
        mobileFallback?: boolean
    }[]
) {
    const defaults = {
        bg: false,
        dx: 0,
        dy: 0,
        bold: false,
        size: 12,
        align: "mr",
        color: "#8C8C8C",
        width: 20,
        italic: false,
        underline: false,
        showMobile: true,
        showDesktop: true,
        connectorLine: {
            type: "straight",
            circle: false,
            stroke: 1,
            enabled: false,
            arrowHead: "lines",
            circleStyle: "solid",
            circleRadius: 10,
            inheritColor: false,
            targetPadding: 4
        },
        mobileFallback: false
    };
    
    const annotationsWithProps = annotations.map((annotation) => ({
        ...defaults,
        ...annotation,
        connectorLine: { ...defaults.connectorLine, ...annotation.connectorLine ?? {} },
    }));

    const response = await fetch(
        `https://api.datawrapper.de/v3/charts/${chartId}`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                metadata: {
                    visualize: {
                        "text-annotations": annotationsWithProps,
                    },
                },
            }),
        }
    )

    if (response.status !== 200) {
        console.log("There is a problem with updateAnnotationsDW!")
        console.log({ chartId, apiKey: "*".repeat(apiKey.length), annotations })
        throw new Error(JSON.stringify(response, null, 1))
    }
}

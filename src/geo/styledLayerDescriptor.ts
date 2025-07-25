import noScientificNotation from "../format/helpers/noScientificNotation.ts";

/**
 * Generates an OpenGIS Styled Layer Descriptor (SLD) XML string, encoded for use in a URL. This function is particularly useful for dynamically styling Web Map Service (WMS) layers, allowing for custom color scales and visual representations of geospatial data directly through the WMS request.
 *
 * The SLD specifies how a map layer should be rendered. This function focuses on creating a `ColorMap` within the SLD, which defines a gradient of colors based on data values. This is commonly used for visualizing continuous data, such as temperature, elevation, or precipitation, on a map.
 *
 * @param layer - The name of the WMS layer to which this SLD will be applied (e.g., `"GDPS.ETA_TT"`).
 * @param colorScale - An array of objects, where each object defines a `color` (hex code) and a `value` (the data threshold for that color). The function will sort these entries by value in ascending order to create a proper color gradient.
 * @returns A URL-encoded XML string representing the Styled Layer Descriptor.
 *
 * @example
 * ```ts
 * // Returns the SLD for the GDPS.ETA_TT layer with a color scale going from blue to red.
 * const sld = styledLayerDescriptor("GDPS.ETA_TT", [
 *   { color: "#550c24", value: 100 },
 *   { color: "#7f2e34", value: 30 },
 *   { color: "#c26847", value: 20 },
 *   { color: "#bdbb7a", value: 10 },
 *   { color: "#e0e9f0", value: 0 },
 *   { color: "#97b4cd", value: -10 },
 *   { color: "#5881a1", value: -20 },
 *   { color: "#334f60", value: -30 },
 *   { color: "#21353f", value: -100 },
 * ]);
 *
 * // The sld can now be used in a WMS request as SLD_BODY.
 * const url = `https://geo.weather.gc.ca/geomet?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&BBOX=-90,-180,90,180&CRS=EPSG:4326&WIDTH=2400&HEIGHT=1200&LAYERS=GDPS.ETA_TT&FORMAT=image/jpeg&SLD_BODY=${sld}`;
 * console.log(url);
 * ```
 * @category Geo
 */
export default function styledLayerDescriptor(
  layer: string,
  colorScale: { color: string; value: number }[],
): string {
  // Color map entrie need to be in ascending order.
  colorScale.sort((a, b) => (a.value < b.value ? -1 : 1));

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"><NamedLayer><se:Name>${layer}</se:Name><UserStyle><Title>Custom style</Title><se:FeatureTypeStyle><se:Rule><se:RasterSymbolizer><se:Opacity>1.0</se:Opacity><ColorMap>${
      colorScale
        .map(
          (item) =>
            `<ColorMapEntry color="${item.color}" quantity="${
              noScientificNotation(item.value)
            }"/>`,
        )
        .join(
          "",
        )
    }</ColorMap></se:RasterSymbolizer></se:Rule></se:FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>`;

  return encodeURIComponent(xml);
}

import React from "react";
import Plot from "react-plotly.js";
import { FilePreviewData } from "../data/files";

const PreviewPlot: React.FC<{
  data: FilePreviewData;
  checkedFields: string[];
}> = ({ data, checkedFields }) => {
  return (
    <Plot
      layout={{
        grid: { rows: checkedFields.length, columns: 1 },
        xaxis: { title: "Time (s)" },
      }}
      data={checkedFields.map((field) =>
        field && data.fields_data
          ? {
              x: data.fields_data.get(field)![0],
              y: data.fields_data.get(field)![1],
              yaxis: "y" + (checkedFields.indexOf(field) + 1),
              name: field,
              showlegend: true,
            }
          : { x: [], y: [] }
      )}
    ></Plot>
  );
};

export default PreviewPlot;

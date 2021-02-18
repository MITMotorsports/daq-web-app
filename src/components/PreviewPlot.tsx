import React from "react";
import Plot from "react-plotly.js";

const PreviewPlot: React.FC<{
  name: string;
  data: [number[], number[]] | undefined;
}> = ({ name, data }) => {
  if (!data) return null;
  return (
    <Plot
      useResizeHandler={true}
      data={[
        {
          x: data[0],
          y: data[1],
          type: "scatter",
        },
      ]}
      layout={{ title: name, autosize: true }}
      style={{ width: "100%", height: "100%" }}
      config={{ responsive: true }}
    />
  );
};

export default PreviewPlot;

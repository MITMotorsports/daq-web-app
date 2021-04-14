import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@material-ui/core";
import React, { useState } from "react";
import Plot from "react-plotly.js";
import { FilePreviewData } from "../data/files";

const CustomPlots: React.FC<{
  data: FilePreviewData;
}> = ({ data }) => {
  const [customGraphs, setCustomGraphs] = useState<[string, string][]>([]);
  return (
    <Grid item>
      {data.fields_data &&
        customGraphs.map(([x_col, y_col], index) => (
          <Grid item container>
            <Grid item>
              <FormControl style={{ minWidth: 100 }}>
                <InputLabel id={"x-col-" + index}>x axis</InputLabel>
                <Select
                  labelId={"x-col-" + index}
                  value={x_col}
                  onChange={(e) => {
                    let newArray = [...customGraphs];
                    let newitem = [...newArray[index]] as [string, string];
                    newArray[index] = newitem;
                    newitem[0] = e.target.value as string;
                    setCustomGraphs(newArray);
                  }}
                >
                  {Array.from(data?.fields_data?.keys()!).map((v) => (
                    <MenuItem key={v} value={v}>
                      <ListItemText>{v}</ListItemText>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl style={{ minWidth: 100 }}>
                <InputLabel id={"y-col-" + index}>y axis</InputLabel>

                <Select
                  labelId={"y-col-" + index}
                  value={y_col}
                  onChange={(e) => {
                    let newArray = [...customGraphs];
                    let newitem = [...newArray[index]] as [string, string];
                    newArray[index] = newitem;
                    newitem[1] = e.target.value as string;
                    setCustomGraphs(newArray);
                  }}
                >
                  {Array.from(data?.fields_data?.keys()!).map((v) => (
                    <MenuItem key={v} value={v}>
                      <ListItemText>{v}</ListItemText>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              {x_col !== "" && y_col !== "" && data.fields_data && (
                <Plot
                  data={[
                    {
                      type: "scatter",
                      mode: "markers",
                      x: data.fields_data?.get(x_col)![1],
                      y: data.fields_data?.get(y_col)![1],
                    },
                  ]}
                  layout={{
                    xaxis: { title: x_col },
                    yaxis: { title: y_col },
                  }}
                ></Plot>
              )}
            </Grid>
          </Grid>
        ))}
      <Button
        onClick={() => setCustomGraphs(customGraphs.concat([["", ""]]))}
        variant="contained"
      >
        Add Custom Graph
      </Button>
    </Grid>
  );
};

export default CustomPlots;

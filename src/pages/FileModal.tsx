import React, { useEffect, useState } from "react";

import {
  LogFile,
  getDownloadUrlForFile,
  FilePreviewData,
  getPreviewData,
} from "../data/files";
import {
  TextField,
  Button,
  Typography,
  List,
  ListSubheader,
  ListItem,
  Grid,
  Checkbox,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// https://github.com/plotly/react-plotly.js/issues/135#issuecomment-501398125
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

interface FileModalProps {
  file: LogFile | null;
}

const FilePreview: React.FC<FileModalProps> = ({ file }) => {
  const [data, setData] = useState<FilePreviewData | null>(null);
  const [fieldChecked, setFieldChecked] = useState<string[]>([
    'field1', 'field2'
  ]);
  useEffect(() => {
    if (!data && file)
      getPreviewData(file)
        .then((obj) => setData(obj))
        .catch((e) => console.warn(e));
  });

  if (data)
    return (
      <div>
        <Grid container justify="flex-start" spacing={2}>
          <Grid item xs={3}>
            <List subheader={<ListSubheader>Info</ListSubheader>}>
              {data.info?.map(([k, v]) => (
                <ListItem style={{ padding: 0 }}>
                  <Grid container spacing={3}>
                    <Grid item>
                      <Typography>{k}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography>{v}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>

            {data.gps_coords ? (
              <div style={{ height: "300px", width: "300px" }}>
                <MapContainer
                  bounds={L.latLngBounds(data.gps_coords)}
                  scrollWheelZoom={false}
                  style={{ position: "static", height: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Polyline positions={data.gps_coords} />
                </MapContainer>
              </div>
            ) : null}
          </Grid>

          <Grid item xs>
            <List
              subheader={<ListSubheader>Fields</ListSubheader>}
              style={{ display: "flex", flexDirection: "row" }}
            >
              {data.fields_data && data.fields_data.size > 0 ? (
                Array.from(data.fields_data.keys()).map((x) => (
                  <ListItem style={{ padding: 0 }}>
                    <Checkbox
                      checked={!!fieldChecked?.find((k) => k === x)}
                      onChange={(e) => {
                        let newChecked = [...fieldChecked];
                        console.log(fieldChecked);
                        if (e.target.checked) {
                          newChecked.push(x);
                        } else {
                          const index = fieldChecked.findIndex((k) => k === x);
                          newChecked.splice(index, 1);
                        }
                        setFieldChecked(newChecked);
                      }}
                    ></Checkbox>
                    <Typography>{x}</Typography>
                  </ListItem>
                ))
              ) : (
                <Alert severity="warning">No fields available</Alert>
              )}
            </List>
            <div style={{ flexGrow: 1 }}>
              <Grid container spacing={0}>
                {data.fields_data
                  ? Array.from(data.fields_data.keys()).map((field) =>
                      !!fieldChecked?.find((k) => k === field) ? (
                        <Grid item xs>
                          <Plot
                            useResizeHandler={true}
                            data={[
                              {
                                x: data.fields_data!.get(field)![0],
                                y: data.fields_data!.get(field)![1],
                                type: "scatter",
                              },
                            ]}
                            layout={{ title: field, autosize: true }}
                            style={{ width: "100%", height: "100%" }}
                            config={{ responsive: true }}
                          />
                        </Grid>
                      ) : null
                    )
                  : null}
              </Grid>
            </div>
          </Grid>
        </Grid>
      </div>
    );

  return null;
};
const FileModal: React.FC<FileModalProps> = ({ file }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
  const [copySuccess, setCopySuccess] = useState("");

  if (file === null) {
    return <Typography>No File Selected</Typography>;
  }

  getDownloadUrlForFile(file.id, "parsed")
    .then((resp) => setDownloadUrl(resp))
    .catch(() =>
      console.warn(`Could not fetch download link for file ${file.id}`)
    );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(downloadUrl as string);
    setCopySuccess("Copied!");
  };

  return (
    <div>
      <TextField
        label="url"
        defaultValue="No Download Url Available."
        value={downloadUrl ? urlToMatlabCode(downloadUrl) : undefined}
        InputProps={{ readOnly: true }}
      />
      <Button disabled={downloadUrl === undefined} onClick={copyToClipboard}>
        Copy Url
      </Button>
      <Typography>{copySuccess}</Typography>
      <FilePreview file={file}></FilePreview>
    </div>
  );
};
export default FileModal;

const urlToMatlabCode = (url: string) => `data = webread("${url}");`;

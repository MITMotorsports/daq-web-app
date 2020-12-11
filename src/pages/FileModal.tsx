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
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import {
  MapContainer,
  TileLayer,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// https://github.com/plotly/react-plotly.js/issues/135#issuecomment-501398125
import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

interface FileModalProps {
  file: LogFile | null;
}

const FilePreview: React.FC<FileModalProps> = ({ file }) => {
  const [data, setData] = useState<FilePreviewData | null>(null);
  useEffect(() => {
    if (!data && file)
      getPreviewData(file)
        .then((obj) => setData(obj))
        .catch((e) => console.warn(e));
  });

  if (data)
    return (
      <div>
        <List subheader={<ListSubheader>Fields</ListSubheader>}>
          {data.fields_data && data.fields_data.size > 0 ? (
            Array.from(data.fields_data.keys()).map((x) => (
              <ListItem><Typography>{x}</Typography></ListItem>
            ))
          ) : (
            <Alert severity="warning">No fields available</Alert>
          )}
        </List>
        <List subheader={<ListSubheader>Info</ListSubheader>}>
          {data.info?.map(([k, v]) => (
            <ListItem>
              <Grid container spacing={3}>
                <Grid item><Typography>{k}</Typography></Grid>
                <Grid item><Typography>{v}</Typography></Grid>
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

        {data.fields_data
          ? Array.from(data.fields_data.keys()).map((field) => (
              <Plot
                data={[
                  {
                    x: data.fields_data!.get(field)![0],
                    y: data.fields_data!.get(field)![1],
                    type: "scatter",
                  },
                ]}
                layout={{ title: field }}
              />
            ))
          : null}
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
      <Typography>{ copySuccess }</Typography >
      <FilePreview file={file}></FilePreview>
    </div>
  );
};
export default FileModal;

const urlToMatlabCode = (url: string) => `data = webread("${url}");`;

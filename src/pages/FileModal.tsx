import React, { useState } from "react";

import { LogFile, getDownloadUrlForFile } from "../data/files";
import { TextField, Button, Typography, Box, List, ListSubheader, ListItem, Grid } from "@material-ui/core";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// https://github.com/plotly/react-plotly.js/issues/135#issuecomment-501398125
import Plotly from "plotly.js"
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

interface FileModalProps {
  file: LogFile | null;
}
const polyline : L.LatLng[] = [
  new L.LatLng(51.505, -0.09),
  new L.LatLng(51.51, -0.1),
  new L.LatLng(51.51, -0.12),
];
const fields: string[] = ["placeholder1", "placeholder2"];
const info: string[][] = [["speed", "1"], ["power", "2"]];

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

      <List subheader={
        <ListSubheader>
          Fields
        </ListSubheader>

      }>
        {
          fields.map(x => <ListItem>{x}</ListItem>)
        }
      </List>
      <Grid container>

        {info.map(([k, v]) => <Grid container item spacing={3}>
          <Grid item>{k}</Grid>
          <Grid item>{v}</Grid>
          </Grid>)}
      </Grid>
      <div style={{height: '300px', width: '300px'}}>
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{ position: 'static', height:"100%" }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        />
          <Polyline positions={polyline}/>
        </MapContainer>
      </div>

      <Plot data={[{ x: [1, 2, 3], y: [4, 5, 6], type: 'scatter' }]} layout={{ width: 320, height: 240, title: 'A Fancy Plot' }}/>
      {copySuccess}
    </div>
  );
};

export default FileModal;

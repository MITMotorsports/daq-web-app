import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LogFile,
  getDownloadUrlForPath,
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
  ListItemText,
  CircularProgress,
  Select,
  MenuItem
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
  const [columnNames, setColumnNames] = React.useState<string[]>([]);
  const [loadingFileLink, setLoadingFileLink] = React.useState(false);

  // const classes = useStyles();

  async function handleRequestFile() {
    console.log("run request");
    setLoadingFileLink(true);
    const columns = file!.columns.filter((col) =>
      columnNames.includes(col.alias)
    );
    console.log(columns);

    try {
      const resp = await axios.post(
        "https://us-central1-mitmotorsportsdata.cloudfunctions.net/handle_csv_request",
        {
          file_id: file!.id,
          columns: columns,
        },
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log(resp);
      getDownloadUrlForPath(resp.data).then((url) => setDownloadUrl(url));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFileLink(false);
    }
  }

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setColumnNames(event.target.value as string[]);
  };

  if (file === null) {
    return <Typography>No File Selected</Typography>;
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      downloadUrl ? urlToMatlabCode(downloadUrl) : ""
    );
    setCopySuccess("Copied!");
  };

  return (
    <div>
      <Select
        value={columnNames}
        onChange={handleChange}
        renderValue={(selected) => (selected as string[]).join(", ")}
        multiple
      >
        {file.columns.map((v) => (
          <MenuItem key={v.message + v.field + v.alias} value={v.alias}>
            <Checkbox checked={columnNames.indexOf(v.alias) > -1} />
            <ListItemText
              primary={`${v.message}.${v.field} as ${v.alias}`}
              secondary={v.unit}
            />
          </MenuItem>
        ))}
      </Select>
      {loadingFileLink ? (
        <CircularProgress />
      ) : (
        <Button onClick={handleRequestFile} disabled={columnNames.length === 0}>
          {"Request File"}
        </Button>
      )}
      <TextField
        label="url"
        value={downloadUrl ? urlToMatlabCode(downloadUrl) : ""}
        InputProps={{ readOnly: true }}
      />
      <Button disabled={downloadUrl === undefined} onClick={copyToClipboard}>
        Copy MATLAB Snippet
      </Button>
      <Typography>{copySuccess}</Typography>
      <FilePreview file={file}></FilePreview>
    </div>
  );
};
export default FileModal;

const urlToMatlabCode = (url: string) =>
  `if ~exist('d', 'var');disp('Loading data...');d = webread("${url}", weboptions('ContentType','table'));disp('Loaded');end`;

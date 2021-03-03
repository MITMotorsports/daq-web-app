import React, { useEffect, useState } from "react";

import GPSMap from "../components/GPSMap";
import PreviewPlot from "../components/PreviewPlot";

import { LogFile, FilePreviewData, getPreviewData } from "../data/files";
import {
  Typography,
  List,
  ListSubheader,
  ListItem,
  Grid,
  Checkbox,
  CircularProgress,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

interface Props {
  file: LogFile;
}

const FilePreview: React.FC<Props> = ({ file }) => {
  const [data, setData] = useState<FilePreviewData | null>(null);
  const [fieldChecked, setFieldChecked] = useState<string[]>([
    "field1",
    "field2",
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

            {data.gps_coords ? <GPSMap coords={data.gps_coords} /> : null}
          </Grid>

          <Grid item xs>
            <List
              subheader={<ListSubheader>Fields</ListSubheader>}
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {data.fields_data && data.fields_data.size > 0 ? (
                Array.from(data.fields_data.keys()).map((x) => (
                  <ListItem style={{ padding: 0, width: "auto" }}>
                    <Checkbox
                      checked={!!fieldChecked?.find((k) => k === x)}
                      onChange={(e) => {
                        let newChecked = [...fieldChecked];
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
                          <PreviewPlot
                            name={field}
                            data={data.fields_data?.get(field)}
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

  return (
    <>
      <br></br>
      <CircularProgress style={{ margin: "5vh", marginLeft: "35vw" }} />
    </>
  );
};
export default FilePreview;

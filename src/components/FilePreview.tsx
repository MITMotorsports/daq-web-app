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
  Select,
  ListItemText,
  MenuItem,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

interface Props {
  file: LogFile;
}

const FilePreview: React.FC<Props> = ({ file }) => {
  const [data, setData] = useState<FilePreviewData | null>(null);
  const [fieldChecked, setFieldChecked] = useState<string[]>([]);
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
          </Grid>

          <Grid item xs>
            <List subheader={<ListSubheader>Fields</ListSubheader>}>
              {data.fields_data && data.fields_data.size > 0 ? (
                <Select
                  value={fieldChecked}
                  onChange={(e) => setFieldChecked(e.target.value as [])}
                  renderValue={(selected) => (selected as string[]).join(", ")}
                  multiple
                >
                  {Array.from(data?.fields_data?.keys()).map((v) => (x!== "time" && 
                    <MenuItem key={v} value={v}>
                      <ListItemText>{v}</ListItemText>
                      <Checkbox
                        checked={fieldChecked?.indexOf(v) > -1}
                      ></Checkbox>
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <Alert severity="warning">No fields available</Alert>
              )}
            </List>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item>
            {data.gps_coords ? <GPSMap coords={data.gps_coords} /> : null}
          </Grid>
          <Grid item>
            {data.fields_data
              ? (() => {
                  const checked_fields = Array.from(
                    data.fields_data.keys()
                  ).filter((field) => !!fieldChecked?.find((k) => k === field));
                  return (
                    <PreviewPlot data={data} checkedFields={checked_fields} />
                  );
                })()
              : null}
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

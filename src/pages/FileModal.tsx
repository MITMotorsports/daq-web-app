import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LogFile,
  getDownloadUrlForPath,
  FilePreviewData,
  getPreviewData,
} from "../data/files";
import GPSMap from "../components/GPSMap";
import PreviewPlot from "../components/PreviewPlot";
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
  MenuItem,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

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

  return  <CircularProgress />;
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
              primary={
                `${v.message}.${v.field}` + (v.alias ? ` as ${v.alias}` : "")
              }
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

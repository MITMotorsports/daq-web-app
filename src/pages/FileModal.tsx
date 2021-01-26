import React, { useState } from "react";
import axios from "axios";

import { getDownloadUrlForPath, LogFile } from "../data/files";
import {
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  CircularProgress,
} from "@material-ui/core";

interface FileModalProps {
  file: LogFile | null;
}

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
      {copySuccess}
    </div>
  );
};
export default FileModal;

const urlToMatlabCode = (url: string) =>
  `if ~exist('d', 'var');disp('Loading data...');d = webread("${url}", weboptions('ContentType','table'));disp('Loaded');end`;

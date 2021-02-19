import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LogFile,
  getDownloadUrlForPath,
  FileMetadata,
  setFileMetadata,
} from "../data/files";
import FilePreview from "../components/FilePreview";
import {
  TextField,
  Button,
  Typography,
  Checkbox,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
} from "@material-ui/core";

import UploadListItem from "../components/UploadListItem";

interface FileModalProps {
  file: LogFile | null;
  onExited: () => void;
}

const FileModal: React.FC<FileModalProps> = ({ file, onExited }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
  const [copySuccess, setCopySuccess] = useState("");
  const [columnNames, setColumnNames] = React.useState<string[]>([]);
  const [loadingFileLink, setLoadingFileLink] = React.useState(false);

  const [metadata, setMetadata] = useState<FileMetadata | undefined>(
    file?.metadata
  );
  useEffect(() => {
    file && setMetadata(file.metadata);
  }, [file]);

  if (!file) return null;
  async function handleRequestFile() {
    console.log("run request");
    setLoadingFileLink(true);
    const columns = file!.columns.filter((col) =>
      columnNames.includes(col.alias)
    );
    console.log(columns);

    const cacheKey = columnNames
      .sort()
      .reduce((prev, curr) => `${prev},${curr}`);

    if (file?.cache?.has(cacheKey)) {
      const path = getPathForCachedFile(file.id, file.cache.get(cacheKey)!);
      getDownloadUrlForPath(path).then((url) => setDownloadUrl(url));
    } else {
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
      }
    }
    setLoadingFileLink(false);
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
    <Dialog open={file !== null} onClose={onExited} maxWidth="lg" fullWidth>
      <DialogTitle>
        {file && file.name}
        <Typography>{file && file.uploadDate.toLocaleString()}</Typography>
      </DialogTitle>
      <DialogContent>
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
          <Button
            onClick={handleRequestFile}
            disabled={columnNames.length === 0}
          >
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
        {metadata ? (
          <UploadListItem
            file={{
              file: file,
              uploadInfo: null,
              setMetadata: (k: string, v: string) => {
                let tmp = JSON.parse(JSON.stringify(metadata));
                (tmp as any)[k] = v;
                setMetadata(tmp);
              },
              metadata: metadata,
            }}
          ></UploadListItem>
        ) : null}
        <Button onClick={onExited}>Cancel</Button>
        <Button
          onClick={() => {
            metadata && setFileMetadata(file, metadata).then(onExited);
          }}
        >
          Save and Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};
export default FileModal;

const urlToMatlabCode = (url: string) =>
  `if ~exist('d', 'var');disp('Loading data...');d = webread("${url}", weboptions('ContentType','table'));disp('Loaded');end`;

const getPathForCachedFile = (fileId: string, csvFileName: string) =>
  `prototype/${fileId}/${csvFileName}`;

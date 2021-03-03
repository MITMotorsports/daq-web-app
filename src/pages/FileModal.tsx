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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@material-ui/core";

import UploadListItem from "../components/UploadListItem";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Autocomplete from "@material-ui/lab/Autocomplete";

interface FileModalProps {
  file: LogFile | null;
  onExited: () => void;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const FileModal: React.FC<FileModalProps> = ({ file, onExited }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
  const [copySuccess, setCopySuccess] = useState(false);
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [loadingFileLink, setLoadingFileLink] = useState(false);

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

  if (file === null) {
    return <Typography>No File Selected</Typography>;
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      downloadUrl ? urlToMatlabCode(downloadUrl) : ""
    );
    setCopySuccess(true);
  };

  const frequencyOptions = ["10", "50", "100", "100"];

  const columnArray =
    file.columns.length === 0
      ? []
      : file.columns.map((v) => `${v.message}.${v.field} as ${v.alias}`);

  return (
    <Dialog open={file !== null} onClose={onExited} maxWidth="lg" fullWidth>
      <DialogTitle>
        {file && file.name}
        <Typography>{file && file.uploadDate.toLocaleString()}</Typography>
      </DialogTitle>
      <DialogContent>
        <Autocomplete
          autoComplete
          multiple
          disableCloseOnSelect
          options={frequencyOptions}
          renderInput={(params) => (
            <TextField {...params} label="Sample Frequency" margin="normal" />
          )}
        />

        <div style={{ display: "flex", flexDirection: "row" }}>
          <Autocomplete
            autoComplete
            multiple
            disableCloseOnSelect
            options={columnArray}
            defaultValue={columnArray}
            style={{ width: "50vw", overflowY: "scroll", maxHeight: "115px" }}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  checked={selected}
                />
                {option}
              </React.Fragment>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Request File(s)" margin="normal" />
            )}
            onChange={(event: any, newValue: string[]) => {
              setColumnNames(newValue);
              console.log(columnNames);
            }}
          />
        </div>

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

        {copySuccess ? <Typography>Copied!</Typography> : null}
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

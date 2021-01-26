import React, { useState } from "react";

import { LogFile, getDownloadUrlForFile } from "../data/files";
import { TextField, Button, Typography } from "@material-ui/core";

interface FileModalProps {
  file: LogFile | null;
}

const FileModal: React.FC<FileModalProps> = ({ file }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
  const [copySuccess, setCopySuccess] = useState("");
  if (file === null) {
    return <Typography>No File Selected</Typography>;
  }

  getDownloadUrlForFile(file.id, "full.csv")
    .then((resp) => setDownloadUrl(resp))
    .catch(() =>
      console.warn(`Could not fetch download link for file ${file.id}`)
    );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      downloadUrl ? urlToMatlabCode(downloadUrl) : ""
    );
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
        Copy MATLAB Snippet
      </Button>
      {copySuccess}
    </div>
  );
};
export default FileModal;

const urlToMatlabCode = (url: string) =>
  `if ~exist('d', 'var');disp('Loading data...');d = webread("${url}", weboptions('ContentType','table'));disp('Loaded');end`;

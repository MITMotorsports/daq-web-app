import React, { useState } from "react";
import { LogFile, getDownloadUrlForFile } from "../data/files";
import { Button, ButtonGroup, ListItem, ListItemText } from "@material-ui/core";

interface FileListItemProps {
  file: LogFile;
  onClick: () => void;
}

const FileListItem: React.FC<FileListItemProps> = ({ file, onClick }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
  const [matlabUrl, setMatlabUrl] = useState<string | undefined>(undefined);
  getDownloadUrlForFile(file.id, "parsed")
    .then((resp) => setDownloadUrl(resp))
    .catch(() =>
      console.warn(`Could not fetch download link for file ${file.id}`)
    );
  getDownloadUrlForFile(file.id, "full.mat")
    .then((resp) => setMatlabUrl(resp))
    .catch(() =>
      console.warn(`Could not fetch matlab download link for file ${file.id}`)
    );
  return (
    <ListItem button onClick={() => onClick()}>
      <ListItemText
        primary={file.name}
        secondary={file.uploadDate.toLocaleString()}
      />

      <ButtonGroup>
        <Button disabled={matlabUrl === undefined} variant="contained">
          MAT
        </Button>
        <Button disabled={downloadUrl === undefined} variant="contained">
          NPZ
        </Button>
      </ButtonGroup>
    </ListItem>
  );
};

export default FileListItem;

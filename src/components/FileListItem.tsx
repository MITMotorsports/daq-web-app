import React, { useState } from "react";
import { LogFile, getDownloadUrlForFile } from "../data/files";
import { Button, ListItem, ListItemText } from "@material-ui/core";

interface FileListItemProps {
  file: LogFile;
  onClick: () => void;
}

const FileListItem: React.FC<FileListItemProps> = ({ file, onClick }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
  getDownloadUrlForFile(file.id, "parsed")
    .then((resp) => setDownloadUrl(resp))
    .catch(() =>
      console.warn(`Could not fetch download link for file ${file.id}`)
    );
  return (
    <ListItem button onClick={() => onClick()}>
      <ListItemText
        primary={file.name}
        secondary={file.uploadDate.toLocaleString()}
      />

      <Button disabled={downloadUrl === undefined} variant="contained">
        Download
      </Button>
    </ListItem>
  );
};

export default FileListItem;

import React, { useState } from "react";
import { LogFile, getDownloadUrlForFile, deleteFile } from "../data/files";
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogTitle,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

interface FileListItemProps {
  file: LogFile;
  onClick: () => void;
  reloadFiles: () => void;
}

const FileListItem: React.FC<FileListItemProps> = ({
  file,
  onClick,
  reloadFiles,
}) => {
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  getDownloadUrlForFile(file.id, "parsed.npz")
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
      <div onClick={(e) => e.stopPropagation()}>
        <Button onClick={() => setDeleteOpen(true)}>
          <DeleteIcon />
        </Button>
        <Dialog open={deleteOpen}>
          <DialogTitle>
            {`Remove ${file.name} from list? This will not delete the file from the database.`}
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setDeleteOpen(false);
                deleteFile(file.id).then(reloadFiles);
              }}
              color="secondary"
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>

        <ButtonGroup>
          <Button onClick={() => onClick()} variant="contained">
            MAT
          </Button>
          <Button
            disabled={downloadUrl === undefined}
            href={downloadUrl ?? ""}
            variant="contained"
          >
            NPZ
          </Button>
        </ButtonGroup>
      </div>
    </ListItem>
  );
};

export default FileListItem;

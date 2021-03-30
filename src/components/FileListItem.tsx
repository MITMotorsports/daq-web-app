import React, { useState } from "react";
import { LogFile, getDownloadUrlForFile, deleteFile } from "../data/files";
import { setFavorite } from "../data/user";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  CircularProgressProps,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { Favorite, FavoriteBorder } from "@material-ui/icons";
import { Done, Error, HourglassEmpty } from "@material-ui/icons";

interface FileListItemProps {
  file: LogFile;
  onClick: () => void;
  reloadFiles: () => void;
  isFavorite: boolean;
  reloadUser: () => void;
}

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number }
) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="static" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const FileListItem: React.FC<FileListItemProps> = ({
  file,
  onClick,
  reloadFiles,
  isFavorite,
  reloadUser,
}) => {
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const downloadUrl = file.npzURL;

  const renderParseStatus = (status: string | number | undefined) => {
    if (status === undefined) {
      return null;
    }
    if (status === "uploaded") {
      return <HourglassEmpty />;
    } else if (status === "started") {
      return <CircularProgress />;
    } else if (status === "failed") {
      return <Error />;
    } else if (status === "done") {
      return <Done />;
    } else if (typeof status === "number") {
      return (
        <CircularProgressWithLabel variant="static" value={status * 100} />
      );
    } else {
      return null;
    }
  };
  return (
    <ListItem button onClick={() => onClick()}>
      <ListItemText
        primary={file.name}
        secondary={file.uploadDate.toLocaleString()}
      />
      {renderParseStatus(file.parse_status)}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ alignItems: "center" }}
      >
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
        <Button
          onClick={async () => {
            await setFavorite(file.id, !isFavorite);
            reloadUser();
          }}
        >
          {isFavorite ? <Favorite /> : <FavoriteBorder />}
        </Button>

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

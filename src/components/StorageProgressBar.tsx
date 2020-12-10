import React, { useState } from "react";

import { LinearProgress, Box } from "@material-ui/core";
import DoneIcon from "@material-ui/icons/Done";

interface StorageProgressBarProps {
  uploadInfo: firebase.storage.UploadTask;
}

const StorageProgressBar: React.FC<StorageProgressBarProps> = ({
  uploadInfo,
}) => {
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(() => {
        return (
          (uploadInfo.snapshot.bytesTransferred /
            uploadInfo.snapshot.totalBytes) *
          100
        );
      });
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={progress !== 100 ? "secondary" : "primary"}
      />
      {progress === 100 && <DoneIcon />}
    </Box>
  );
};

export default StorageProgressBar;

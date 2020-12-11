import React, { useState, useCallback, useReducer } from "react";
import { useDropzone } from "react-dropzone";

import Backup from "@material-ui/icons/Backup";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import UploadListItem from "../components/UploadListItem";
import { Card, CardContent, List, Button, Box, Typography } from "@material-ui/core";

export interface FileUploadWatcher {
  file: File;
  uploadInfo: firebase.storage.UploadTask | null;
}

const UploadModal: React.FC = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [filenames, setFilenames] = useState([] as FileUploadWatcher[]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFilenames((filenames) => [
      ...filenames,
      ...acceptedFiles.map((file) => ({
        file: file,
        uploadInfo: null,
      })),
    ]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = () => {
    filenames
      .filter((file) => file.uploadInfo === null)
      .forEach((fileToUpload: FileUploadWatcher) => {
        const { file } = fileToUpload;
        if (file.size < 100000000) {
          const firestoreRef = firebase.firestore().collection("files").doc();
          const storageRef = firebase
            .storage()
            .ref(`prototype/${firestoreRef.id}/raw`);

          // Begin upload
          const uploadInfo = storageRef.put(file);

          // Upload metadata when file is done uploading
          uploadInfo.then(() =>
            firestoreRef.set({
              name: file.name,
              uploaded: firebase.firestore.FieldValue.serverTimestamp(),
            })
          );

          fileToUpload.uploadInfo = uploadInfo;
          forceUpdate();
        } else {
          console.error(
            `file ${file.name} was too large. Do not upload files larger than 100MB`
          );
        }
      });
  };

  return (
    <div>
      <Card {...getRootProps()}>
        <CardContent>
          <Backup />
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography>Drop the files here ...</Typography>
          ) : (
            <Typography>Drag 'n' drop some files here, or click to select files</Typography>
          )}
        </CardContent>
      </Card>

      <List>
        {filenames.map((file, index) => (
          <UploadListItem file={file} key={index} />
        ))}
      </List>
      <Box style={{ justifyContent: "center" }}>
        <Button onClick={handleUpload}>Upload</Button>
      </Box>
    </div>
  );
};

export default UploadModal;

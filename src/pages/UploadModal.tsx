import React, { useState, useCallback, useReducer } from "react";
import { useDropzone } from "react-dropzone";

import Backup from "@material-ui/icons/Backup";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import UploadListItem from "../components/UploadListItem";
import {
  Card,
  CardContent,
  List,
  Button,
  Box,
  Typography,
} from "@material-ui/core";
import { FileMetadata, LogFile, MetadataField } from "../data/files";
export interface FileUploadWatcher {
  file: File | LogFile;
  uploadInfo: firebase.storage.UploadTask | null;
  setMetadata: (key: string, value: string) => void;
  metadata: FileMetadata;
}

const UploadModal: React.FC = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [filenames, setFilenames] = useState([] as FileUploadWatcher[]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFilenames((filenames) => [
      ...filenames,
      ...acceptedFiles.map((file) => {
        let metadata: FileMetadata = {};
        return {
          file: file,
          uploadInfo: null,
          setMetadata: (k: string, v: string) => {
            (metadata as any)[k] = v;
          },
          metadata: metadata,
        };
      }),
    ]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".TSV, .tsv, .npz, .NPZ, .fsae",
  });

  const handleUpload = () => {
    filenames
      .filter((file) => file.uploadInfo === null)
      .forEach((fileToUpload: FileUploadWatcher) => {
        const { file } = fileToUpload;
        if (file instanceof File && file.size < 100000000) {
          const ext = file.name.split(".").pop()?.toLowerCase();
          const isParsed = ext === "npz";
          const firestoreRef = firebase.firestore().collection("files").doc();
          const storageRef = firebase
            .storage()
            .ref(
              `prototype/${firestoreRef.id}/` +
                (isParsed ? "parsed.npz" : "raw")
            );

          // Begin upload
          const uploadInfo = storageRef.put(file);

          // Upload metadata when file is done uploading
          uploadInfo
            .then(() =>
              firestoreRef.set({
                name: file.name,
                uploaded: firebase.firestore.FieldValue.serverTimestamp(),
                metadata: fileToUpload.metadata,
              })
            )
            .then(
              () =>
                isParsed &&
                storageRef.updateMetadata({
                  contentDisposition:
                    'attachment; filename="' + file.name + '"',
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

  // eslint-disable-next-line
  const updateMetadataFields = (field: MetadataField, value: string) => {
    setFilenames(
      filenames.map((filename) => {
        filename.metadata[field] = value;
        return filename;
      })
    );
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "grey",
              }}
            >
              <Typography>
                Drag 'n' drop some files here, or click to select files
              </Typography>
              <Typography>(only TSV, NPZ, FSAE files allowed)</Typography>
            </div>
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

import React, { useState, useCallback, useReducer } from "react";
import { useDropzone } from "react-dropzone";

import Backup from "@material-ui/icons/Backup";

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import UploadListItem from "../components/UploadListItem";
import {
  CHASSIS_OPTIONS,
  LOCATION_OPTIONS,
  CAR_ACTIVITIES_OPTIONS,
} from "../components/UploadListItem";
import {
  Card,
  CardContent,
  List,
  Button,
  Box,
  Typography,
  ListItem,
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
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = () => {
    filenames
      .filter((file) => file.uploadInfo === null)
      .forEach((fileToUpload: FileUploadWatcher) => {
        const { file } = fileToUpload;

        if (file instanceof File && file.size < 100000000) {
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
              metadata: fileToUpload.metadata,
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

  const updateMetadataFields = (field: MetadataField, value: string) => {
    setFilenames(
      filenames.map((filename) => {
        filename.metadata[field] = value;
        console.log(field, "and", value);
        return filename;
      })
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <ListItem style={{ margin: "0", padding: "0" }}>
          <Card style={{ margin: "0", padding: "0" }}>
            <CardContent style={{ margin: "0", padding: "0.5vh" }}>
              <FormControl required style={{ minWidth: 90 }}>
                <InputLabel>Chassis</InputLabel>
                <Select
                  autoWidth
                  onChange={(e) =>
                    updateMetadataFields("chassis", e.target.value as string)
                  }
                >
                  {CHASSIS_OPTIONS.map((chassis) => (
                    <MenuItem
                      key={chassis}
                      style={{
                        fontSize: "1.5vh",
                        margin: "0.7vh",
                        padding: "0.3vh",
                      }}
                      value={chassis}
                    >
                      {chassis}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </ListItem>
        <ListItem style={{ margin: "0", padding: "0" }}>
          <Card style={{ margin: "0", padding: "0" }}>
            <CardContent style={{ margin: "0", padding: "0.5vh" }}>
              <FormControl required style={{ minWidth: 90 }}>
                <InputLabel>Location</InputLabel>
                <Select
                  autoWidth
                  onChange={(e) =>
                    updateMetadataFields("location", e.target.value as string)
                  }
                >
                  {LOCATION_OPTIONS.map((location) => (
                    <MenuItem
                      key={location}
                      style={{
                        fontSize: "1.5vh",
                        margin: "0.7vh",
                        padding: "0.3vh",
                      }}
                      value={location}
                    >
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </ListItem>
        <ListItem style={{ margin: "0", padding: "0" }}>
          <Card style={{ margin: "0", padding: "0" }}>
            <CardContent style={{ margin: "0", padding: "0.5vh" }}>
              <FormControl required style={{ minWidth: 90 }}>
                <InputLabel>Activity</InputLabel>
                <Select
                  autoWidth
                  onChange={(e) =>
                    updateMetadataFields("activity", e.target.value as string)
                  }
                >
                  {CAR_ACTIVITIES_OPTIONS.map((activity) => (
                    <MenuItem
                      key={activity}
                      style={{
                        fontSize: "1.5vh",
                        margin: "0.7vh",
                        padding: "0.3vh",
                      }}
                      value={activity}
                    >
                      {activity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </ListItem>
      </div>
      <Card {...getRootProps()}>
        <CardContent>
          <Backup />
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography>Drop the files here ...</Typography>
          ) : (
            <Typography>
              Drag 'n' drop some files here, or click to select files
            </Typography>
          )}
        </CardContent>
      </Card>

      <List>
        {filenames.map((file, index) => (
          <UploadListItem file={file} key={index} />
        ))}
        {console.log(filenames.length)}
      </List>
      <Box style={{ justifyContent: "center" }}>
        <Button onClick={handleUpload}>Upload</Button>
      </Box>
    </div>
  );
};

export default UploadModal;

import React, { useReducer } from "react";
import Dropzone from "react-dropzone";
import UploadListItem from "../components/UploadListItem";

import MasterChassis, { DEFAULT_CHASSIS } from "../components/MasterChassis";
import MasterActivity, { DEFAULT_ACTIVITY } from "../components/MasterActivity";
import MasterLocation, { DEFAULT_LOCATION } from "../components/MasterLocation";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";

import { List, Button, Box, InputLabel } from "@material-ui/core";
import { FileMetadata, LogFile } from "../data/files";
export interface FileUploadWatcher {
  file: File | LogFile;
  uploadInfo: firebase.storage.UploadTask | null;
  setMetadata: (key: string, value: string) => void;
  metadata: FileMetadata;
}

interface Props {}

interface State {
  filenames: FileUploadWatcher[];
  masterChassis: string;
  masterLocation: string;
  masterActivity: string;
}

class UploadModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      masterChassis: DEFAULT_CHASSIS,
      masterLocation: DEFAULT_LOCATION,
      masterActivity: DEFAULT_ACTIVITY,
      filenames: [],
    };
  }

  handleUpload = () => {
    this.state.filenames
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
          useReducer((x) => x + 1, 0);
        } else {
          console.error(
            `file ${file.name} was too large. Do not upload files larger than 100MB`
          );
        }
      });
  };

  render() {
    return (
      <>
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <div>
              <InputLabel style={{ fontSize: "1.2vh" }}>Chassis</InputLabel>
              <MasterChassis
                onChange={(newChassis: string) => {
                  this.setState({ masterChassis: newChassis });
                }}
              />
            </div>
            <div>
              <InputLabel style={{ fontSize: "1.2vh" }}>Activity</InputLabel>
              <MasterActivity
                onChange={(newActivity: string) => {
                  this.setState({ masterActivity: newActivity });
                }}
              />
            </div>
            <div>
              <InputLabel style={{ fontSize: "1.2vh" }}>Location</InputLabel>
              <MasterLocation
                onChange={(newLocation: string) => {
                  this.setState({ masterLocation: newLocation });
                }}
              />
            </div>
          </div>

          <Dropzone
            onDrop={(acceptedFiles: File[]) => {
              this.setState({
                filenames: [
                  ...this.state.filenames,
                  ...acceptedFiles.map((file) => {
                    let metadata: FileMetadata = {
                      chassis: "MY21",
                      location: "Other",
                      activity: "General",
                    };
                    return {
                      file: file,
                      uploadInfo: null,
                      setMetadata: (k: string, v: string) => {
                        (metadata as any)[k] = v;
                      },
                      metadata: metadata,
                    };
                  }),
                ],
              });
            }}
          >
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
              </section>
            )}
          </Dropzone>

          <List>
            {this.state.filenames.map((file, index) => (
              <UploadListItem
                key={index}
                file={file}
                masterChassis={this.state.masterChassis}
                masterActivity={this.state.masterActivity}
                masterLocation={this.state.masterLocation}
              />
            ))}
            {console.log(this.state.filenames.length)}
          </List>
          <Box style={{ justifyContent: "center" }}>
            <Button onClick={this.handleUpload}>Upload</Button>
          </Box>
        </div>
      </>
    );
  }
}

export default UploadModal;

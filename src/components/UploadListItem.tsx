import React from "react";
import StorageProgressBar from "./StorageProgressBar";
import { FileUploadWatcher } from "../pages/UploadModal";

import FeederChassis from "./FeederChassis";
import FeederActivity from "./FeederActivity";
import FeederLocation from "./FeederLocation";

import { DEFAULT_CHASSIS } from "../components/MasterChassis";
import { DEFAULT_ACTIVITY } from "../components/MasterActivity";
import { DEFAULT_LOCATION } from "../components/MasterLocation";

import TextField from "@material-ui/core/TextField";
import {
  Typography,
  Box,
  Card,
  CardContent,
  ListItem,
  InputLabel,
} from "@material-ui/core";

export const CHASSIS_OPTIONS = ["MY18", "MY19", "MY20", "MY21"];
export const LOCATION_OPTIONS = [
  "Palmer",
  "Alley",
  "Lot",
  "Jackstands",
  "Competition",
  "Other",
];
export const CAR_ACTIVITIES_OPTIONS = [
  "Endurance",
  "Acceleration",
  "Skidpad",
  "Shakedown",
  "Stationary Debugging",
  "General",
];

interface Props {
  file: FileUploadWatcher;
  masterChassis: string;
  masterActivity: string;
  masterLocation: string;
}

interface State {
  myChassis: string;
  myActivity: string;
  myLocation: string;
}

class UploadListItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      myChassis: DEFAULT_CHASSIS,
      myActivity: DEFAULT_ACTIVITY,
      myLocation: DEFAULT_LOCATION,
    };
  }
  render() {
    return (
      <>
        <ListItem style={{ fontSize: "1vh", margin: "0", padding: "0" }}>
          <Card variant="outlined">
            <CardContent
              style={{ fontSize: "1vh", margin: "0", padding: "0.3vh" }}
            >
              <Typography>{this.props.file.file.name}</Typography>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  paddingTop: "5%",
                }}
              >
                <div>
                  <InputLabel style={{ fontSize: "1.2vh" }}>Chassis</InputLabel>
                  <FeederChassis masterChassis={this.props.masterChassis} />
                </div>
                <div>
                  <InputLabel style={{ fontSize: "1.2vh" }}>
                    Activity
                  </InputLabel>
                  <FeederActivity masterActivity={this.props.masterActivity} />
                </div>
                <div>
                  <InputLabel style={{ fontSize: "1.2vh" }}>
                    Location
                  </InputLabel>
                  <FeederLocation masterLocation={this.props.masterLocation} />
                </div>
              </div>
              <TextField
                label="Test Number"
                value={this.props.file.metadata.testNum}
                onChange={(e) =>
                  this.props.file.setMetadata(
                    "testNum",
                    e.target.value as string
                  )
                }
              />
              <TextField
                label="Notes"
                value={this.props.file.metadata.notes}
                onChange={(e) =>
                  this.props.file.setMetadata("notes", e.target.value as string)
                }
              />

              {this.props.file.uploadInfo !== null && (
                <Box width="100%" m={1}>
                  <StorageProgressBar uploadInfo={this.props.file.uploadInfo} />
                </Box>
              )}
            </CardContent>
          </Card>
        </ListItem>
      </>
    );
  }
}

export default UploadListItem;

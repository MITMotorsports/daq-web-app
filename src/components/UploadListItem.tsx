import React from "react";
import StorageProgressBar from "./StorageProgressBar";
import { FileUploadWatcher } from "../pages/UploadModal";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import {
  Typography,
  Box,
  Card,
  CardContent,
  ListItem,
} from "@material-ui/core";

const CHASSIS_OPTIONS = ["MY18", "MY19", "MY20", "MY21"];
const LOCATION_OPTIONS = [
  "Palmer",
  "Alley",
  "Lot",
  "Jackstands",
  "Competition",
  "Other",
];
const CAR_ACTIVITIES_OPTIONS = [
  "Endurance",
  "Acceleration",
  "Skidpad",
  "Shakedown",
  "Stationary Debugging",
  "General",
];

interface UploadListItemProps {
  file: FileUploadWatcher;
}

const UploadListItem: React.FC<UploadListItemProps> = ({ file }) => {
  return (
    <ListItem>
      <Card variant="outlined">
        <CardContent>
          <Typography>{file.file.name}</Typography>

          <FormControl required style={{ minWidth: 90 }}>
            <InputLabel>Chassis</InputLabel>
            <Select autoWidth>
              <MenuItem value="" disabled>
                Chassis
              </MenuItem>
              {CHASSIS_OPTIONS.map((chassis) => (
                <MenuItem value={chassis}>{chassis}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Required</FormHelperText>
          </FormControl>

          <FormControl required style={{ minWidth: 115 }}>
            <InputLabel>Location</InputLabel>
            <Select autoWidth>
              <MenuItem value="" disabled>
                Location
              </MenuItem>
              {LOCATION_OPTIONS.map((location) => (
                <MenuItem value={location}>{location}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Required</FormHelperText>
          </FormControl>
          <FormControl required style={{ minWidth: 150 }}>
            <InputLabel>CAN Spec</InputLabel>
            <Select autoWidth>
              <MenuItem value="" disabled>
                CAN Spec
              </MenuItem>
              {CAR_ACTIVITIES_OPTIONS.map((activity) => (
                <MenuItem value={activity}>{activity}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Required</FormHelperText>
          </FormControl>
          <TextField label="Test Number" />
          <TextField label="Notes" />

          {file.uploadInfo !== null && (
            <Box width="100%" m={1}>
              <StorageProgressBar uploadInfo={file.uploadInfo} />
            </Box>
          )}
        </CardContent>
      </Card>
    </ListItem>
  );
};

export default UploadListItem;

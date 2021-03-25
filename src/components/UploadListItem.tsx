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
            <Select
              autoWidth
              value={file.metadata.chassis}
              onChange={(e) =>
                file.setMetadata("chassis", e.target.value as string)
              }
            >
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
            <Select
              autoWidth
              value={file.metadata.location}
              onChange={(e) =>
                file.setMetadata("location", e.target.value as string)
              }
            >
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
            <InputLabel>Activity</InputLabel>
            <Select
              autoWidth
              value={file.metadata.activity}
              onChange={(e) =>
                file.setMetadata("activity", e.target.value as string)
              }
            >
              <MenuItem value="" disabled>
                Activity
              </MenuItem>
              {CAR_ACTIVITIES_OPTIONS.map((activity) => (
                <MenuItem value={activity}>{activity}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Required</FormHelperText>
          </FormControl>
          <TextField
            label="Test Number"
            value={file.metadata.testNum}
            onChange={(e) =>
              file.setMetadata("testNum", e.target.value as string)
            }
          />
          <TextField
            label="Notes"
            value={file.metadata.notes}
            onChange={(e) =>
              file.setMetadata("notes", e.target.value as string)
            }
          />
          {file.metadata.hyperlink ? (
            <a href={"https://" + file.metadata.hyperlink}>
              <TextField
                label="hyperlink"
                value={file.metadata.hyperlink}
                onChange={(e) =>
                  file.setMetadata("hyperlink", e.target.value as string)
                }
              />
            </a>
          ) : (
            <TextField
              label="hyperlink"
              value={file.metadata.hyperlink}
              onChange={(e) =>
                file.setMetadata("hyperlink", e.target.value as string)
              }
            />
          )}

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

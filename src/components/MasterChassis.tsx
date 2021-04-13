import React from "react";

import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
} from "@material-ui/core";
import { FileUploadWatcher } from "../pages/UploadModal";

export const DEFAULT_CHASSIS = "MY18";
export const DEFAULT_LOCATION = "Palmer";
export const DEFAULT_ACTIVITY = "Endurance";

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
  onChange: (newChassis: string) => void;
}

interface State {}

class MasterChassis extends React.Component<Props, State> {
  render() {
    return (
      <Select
        defaultValue={DEFAULT_CHASSIS}
        onChange={(evt) => {
          const newChassis = evt.target.value as string;
          this.props.onChange(newChassis);
        }}
      >
        {CHASSIS_OPTIONS.map((chassis) => (
          <MenuItem key={chassis} value={chassis}>
            {chassis}
          </MenuItem>
        ))}
      </Select>
    );
  }
}

export default MasterChassis;

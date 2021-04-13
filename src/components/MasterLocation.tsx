import React from "react";

import {
  DEFAULT_LOCATION,
  LOCATION_OPTIONS,
} from "../components/MasterChassis";

import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  TextField,
} from "@material-ui/core";
import { FileUploadWatcher } from "../pages/UploadModal";

interface Props {
  onChange: (newLocation: string) => void;
}

interface State {}

class MasterLocation extends React.Component<Props, State> {
  render() {
    return (
      <Select
        defaultValue={DEFAULT_LOCATION}
        onChange={(evt) => {
          const newLocation = evt.target.value as string;
          this.props.onChange(newLocation);
        }}
      >
        {LOCATION_OPTIONS.map((location) => (
          <MenuItem key={location} value={location}>
            {location}
          </MenuItem>
        ))}
      </Select>
    );
  }
}

export default MasterLocation;

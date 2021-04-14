import React from "react";
import { Select, MenuItem } from "@material-ui/core";

export const DEFAULT_LOCATION = "Palmer";

export const LOCATION_OPTIONS = [
  "Palmer",
  "Alley",
  "Lot",
  "Jackstands",
  "Competition",
  "Other",
];

interface Props {
  onChange: (newLocation: string) => void;
}

interface State {}

class MasterLocation extends React.Component<Props, State> {
  render() {
    return (
      <Select
        label="Location"
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

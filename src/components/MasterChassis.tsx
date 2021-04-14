import React from "react";

import { Select, MenuItem } from "@material-ui/core";

export const DEFAULT_CHASSIS = "MY18";

export const CHASSIS_OPTIONS = ["MY18", "MY19", "MY20", "MY21"];

interface Props {
  onChange: (newChassis: string) => void;
}

interface State {}

class MasterChassis extends React.Component<Props, State> {
  render() {
    return (
      <Select
        label="Chassis"
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

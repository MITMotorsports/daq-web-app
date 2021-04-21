import React from "react";

import { Select, MenuItem } from "@material-ui/core";

export const DEFAULT_ACTIVITY = "Endurance";
export const CAR_ACTIVITIES_OPTIONS = [
  "Endurance",
  "Acceleration",
  "Skidpad",
  "Shakedown",
  "Stationary Debugging",
  "General",
];

interface Props {
  onChange: (newActivity: string) => void;
}

interface State {}

class MasterActivity extends React.Component<Props, State> {
  render() {
    return (
      <Select
        label="Activity"
        defaultValue={DEFAULT_ACTIVITY}
        onChange={(evt) => {
          const newActivity = evt.target.value as string;
          this.props.onChange(newActivity);
        }}
      >
        {CAR_ACTIVITIES_OPTIONS.map((activity) => (
          <MenuItem key={activity} value={activity}>
            {activity}
          </MenuItem>
        ))}
      </Select>
    );
  }
}

export default MasterActivity;

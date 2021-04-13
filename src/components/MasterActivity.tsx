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
import {
  DEFAULT_ACTIVITY,
  CAR_ACTIVITIES_OPTIONS,
} from "../components/MasterChassis";

interface Props {
  onChange: (newActivity: string) => void;
}

interface State {}

class MasterActivity extends React.Component<Props, State> {
  render() {
    return (
      <Select
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

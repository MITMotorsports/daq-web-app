import React from "react";

import { Select, MenuItem } from "@material-ui/core";
import {
  CHASSIS_OPTIONS,
  LOCATION_OPTIONS,
  CAR_ACTIVITIES_OPTIONS,
  DEFAULT_CHASSIS,
  DEFAULT_LOCATION,
  DEFAULT_ACTIVITY,
} from "./MasterChassis";

interface Props {
  masterChassis: string;
  masterLocation: string;
  masterActivity: string;
}

interface State {
  myChassis: string;
  myLocation: string;
  myActivity: string;
  myTestNumber: string;
  myNotes: string;
}

class FeederChassis extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      myChassis: DEFAULT_CHASSIS,
      myLocation: DEFAULT_LOCATION,
      myActivity: DEFAULT_ACTIVITY,
      myTestNumber: "",
      myNotes: "",
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.masterChassis != this.props.masterChassis) {
      this.setState({ myChassis: this.props.masterChassis });
    }
  }

  render() {
    return (
      <Select
        value={this.state.myChassis}
        onChange={(evt) => {
          this.setState({ myChassis: evt.target.value as string });
        }}
      >
        {CHASSIS_OPTIONS.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    );
  }
}

export default FeederChassis;

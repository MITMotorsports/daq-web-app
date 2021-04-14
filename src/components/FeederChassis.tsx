import React from "react";

import { Select, MenuItem } from "@material-ui/core";
import { CHASSIS_OPTIONS, DEFAULT_CHASSIS } from "./MasterChassis";

interface Props {
  masterChassis: string;
}

interface State {
  myChassis: string;
}

class FeederChassis extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      myChassis: DEFAULT_CHASSIS,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.masterChassis !== this.props.masterChassis) {
      this.setState({ myChassis: this.props.masterChassis });
    }
  }

  render() {
    return (
      <Select
        label="Chassis"
        value={this.state.myChassis}
        onChange={(evt) => {
          this.setState({ myChassis: evt.target.value as string });
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

export default FeederChassis;

import React from "react";

import { Select, MenuItem } from "@material-ui/core";

import {
  DEFAULT_LOCATION,
  LOCATION_OPTIONS,
} from "../components/MasterLocation";

interface Props {
  masterLocation: string;
}

interface State {
  myLocation: string;
}

class FeederLocation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      myLocation: DEFAULT_LOCATION,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.masterLocation !== this.props.masterLocation) {
      this.setState({ myLocation: this.props.masterLocation });
    }
  }

  render() {
    return (
      <Select
        label="Location"
        value={this.state.myLocation}
        onChange={(evt) => {
          this.setState({ myLocation: evt.target.value as string });
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

export default FeederLocation;

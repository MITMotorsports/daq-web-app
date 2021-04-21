import React from "react";

import { Select, MenuItem } from "@material-ui/core";
import { CAR_ACTIVITIES_OPTIONS, DEFAULT_ACTIVITY } from "./MasterActivity";

interface Props {
  masterActivity: string;
}

interface State {
  myActivity: string;
}

class FeederActivity extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      myActivity: DEFAULT_ACTIVITY,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.masterActivity !== this.props.masterActivity) {
      this.setState({ myActivity: this.props.masterActivity });
    }
  }

  render() {
    return (
      <Select
        value={this.state.myActivity}
        onChange={(evt) => {
          this.setState({ myActivity: evt.target.value as string });
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

export default FeederActivity;

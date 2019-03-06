import React from 'react';
import { withWidth } from 'material-ui';

class BreakPoint extends React.Component {
  state = {}
  static defaultProps = {
    updateBreakpoint: ()=>{}
  };
  static getDerivedStateFromProps(nextProps,prevState) {
    if (nextProps.width !== prevState.width) {
      console.log('BREAK POINT UPDATED: ' + nextProps.width);
      nextProps.updateBreakpoint(nextProps.width);
      return {
        ...prevState,
        ...nextProps
      }
    }
    return null;
  }
  render() {
    return null;
  }
}

export default withWidth()(BreakPoint);

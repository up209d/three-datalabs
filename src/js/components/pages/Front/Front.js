import React from 'react';
import {
  withStyles,
  Grid,
  FormControl,
  TextField,
  Button,
  CircularProgress,
  Typography
} from 'material-ui';

import ThreeRenderer from './ThreeRenderer/ThreeRenderer';
import TypoRenderer from './TypoRenderer/TypoRenderer';
import utils from 'js/utils';

const style = theme => ({
  container: {
    color: 'black'
  },
  username: {
    // color: 'red'
  },
  password: {
    // color: 'blue'
  },
  submit: {
    color: 'teal'
  }
});

class Front extends React.Component{
  handleSubmit = e => {
    e.preventDefault();
    this.props
      .userLogin(this.username.value,this.password.value)
  };
  render() {
    const { props } = this;
    const { classes } = props;
    return (
      <Grid className={classes.container} container justify={'center'} alignItems={'center'}>
        <Grid item xs={12} md={6} lg={4}>
          <ThreeRenderer id={'canvas-'+this.props.getUID()} step={props.ui.threeRenderer.step}/>
          <TypoRenderer id={'typo-'+this.props.getUID()} title={'DATA ANALYSIS'}/>
        </Grid>
      </Grid>
    )
  }
};

export default utils.getConnectAllStateActions(withStyles(style,{withTheme: true})(Front));
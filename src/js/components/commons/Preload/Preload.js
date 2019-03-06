import React from 'react';
import {
  Grid,
  CircularProgress
} from 'material-ui';

const Preload = props => {
  const { size } = props;
  return (
    <Grid style={{
      display: 'flex',
      flexFlow: 'row nowrap',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: size*2 || 50,
      paddingBottom: size*2 || 50
    }} container justify={'center'} alignItems={'center'}>
      <CircularProgress size={size}/>
    </Grid>
  )
};

Preload.defaultProps = {
  size: 20
};

export default Preload;

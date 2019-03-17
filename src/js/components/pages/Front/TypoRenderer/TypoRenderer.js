import React from 'react';
import {
  withStyles,
  Grid,
  FormControl,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Fade
} from 'material-ui';

import * as POP from 'popmotion';
import posed, { PoseGroup } from 'react-pose';

import {
  ArrowForward,ArrowBack
} from 'material-ui-icons';

import utils from 'js/utils';

const style = theme => ({
  container: {
    position: 'absolute',
    top: '58vh',
    left: 0,
    zIndex: 1,
    // pointerEvents: 'none',
    transform: 'translate(0,0)',
    ['& a']: {
      textDecoration: 'none'
    }
  },
  title: {
    fontWeight: 100,
    fontSize: theme.typography.pxToRem(68),
    textIndent: theme.typography.pxToRem(20),
    letterSpacing: theme.typography.pxToRem(20),
    color: theme.palette.common.white,
    [theme.breakpoints.down('md')] : {
      fontSize: theme.typography.pxToRem(32),
      textIndent: theme.typography.pxToRem(10),
      letterSpacing: theme.typography.pxToRem(10),
    }
  },
  button: {
    width: 36,
    height: 36,
    margin: '0 15px',
    [theme.breakpoints.down('md')] : {
      width: 24,
      height: 24,
      minHeight: 24,
      margin: '0 5px',
    },
    fontSize: theme.typography.pxToRem(16),
    color: theme.palette.common.white,
    borderColor: theme.palette.common.white,
    border: '1px solid ' + theme.palette.common.white,
    backgroundColor: 'transparent',
    transition: 'all .5s cubic-bezier(0,1.04,.45,1.12)',
    '&:hover': {
      color: theme.palette.common.black,
      backgroundColor: theme.palette.common.white,
      transform: 'scale(0.90)'
    },
    '&.active': {
      color: theme.palette.common.black,
      backgroundColor: theme.palette.common.white,
      pointerEvents: 'none',
      '&:hover': {
        color: theme.palette.common.white,
        backgroundColor: 'transparent',
      }
    },
    '&.bullet': {
      width: 24,
      height: 24,
      minHeight: 24
    },
    '&.contact': {
      width: 'auto',
      height: 30,
      minHeight: 30,
      marginTop: 20,
      padding: '5px 20px',
      fontSize: theme.typography.pxToRem(12)
    }
  },
  buttonIcon: {
    width: 16,
    height: 16,
    // '&.back': {
    //   marginTop: 1,
    //   marginRight: 30
    // },
    // '&.forward': {
    //   marginLeft: 30
    // }
  }
});

const Item = posed.div({
  enter: {
    opacity: 1,
    y: 0,
    transition: props => {
      switch (props.key) {
        case 'opacity': {
          return POP.tween({
            ...props,
            duration: 3000,
            delay: 500,
            ease: POP.easing.easeOut
          })
        }
        default: {
          return POP.spring({
            ...props,
            stiffness: 50,
            damping: 30
          })
        }
      }
    }
  },
  exit: {
    opacity: 0,
    y: 500,
  }
});

class TypoRenderer extends React.Component{
  state = {
    titles: ['Hey!','I\'m Duc','AKA U.P','UI/UX DEVELOPER', 'See ya soon!']
  };
  handleSubmit = e => {
    e.preventDefault();
    this.props
      .userLogin(this.username.value,this.password.value)
  };
  render() {
    const { state, props } = this;
    const { classes } = props;
    return (
      <Grid className={classes.container} container justify={'center'} alignItems={'center'}>
        <Grid item xs={12}>
          <PoseGroup>
            {state.titles
              .filter((title,index) => (index === props.ui.threeRenderer.step))
              .map(title => {
                return (
                  <Item key={props.getUID('typo')}>
                    <Typography align={'center'} className={classes.title}>{title.toUpperCase()}</Typography>
                  </Item>
                )
              })
            }
          </PoseGroup>
          <Typography align={'center'}>
            <Button onClick={props.changeThreeRendereStep.bind(null,props.ui.threeRenderer.step-1)} className={classes.button} variant="fab">
              <ArrowBack className={classes.buttonIcon + ' back'}/>
            </Button>

            <Button onClick={props.changeThreeRendereStep.bind(null,0)} className={utils.toggleClassNames({ bullet: true, [classes.button]: true, active: props.ui.threeRenderer.step === 0 })} variant="fab">&nbsp;</Button>
            <Button onClick={props.changeThreeRendereStep.bind(null,1)} className={utils.toggleClassNames({ bullet: true, [classes.button]: true, active: props.ui.threeRenderer.step === 1 })} variant="fab">&nbsp;</Button>
            <Button onClick={props.changeThreeRendereStep.bind(null,2)} className={utils.toggleClassNames({ bullet: true, [classes.button]: true, active: props.ui.threeRenderer.step === 2 })} variant="fab">&nbsp;</Button>
            <Button onClick={props.changeThreeRendereStep.bind(null,3)} className={utils.toggleClassNames({ bullet: true, [classes.button]: true, active: props.ui.threeRenderer.step === 3 })} variant="fab">&nbsp;</Button>
            <Button onClick={props.changeThreeRendereStep.bind(null,4)} className={utils.toggleClassNames({ bullet: true, [classes.button]: true, active: props.ui.threeRenderer.step === 4 })} variant="fab">&nbsp;</Button>

            <Button onClick={props.changeThreeRendereStep.bind(null,props.ui.threeRenderer.step+1)} className={classes.button} variant="fab">
              <ArrowForward className={classes.buttonIcon + ' forward'}/>
            </Button>
          </Typography>
          {
            props.ui.threeRenderer.step === 4 && (
              <Fade in={true} mountOnEnter unmountOnExit timeout={{enter: 2000,exit: 3000}}>
                <Typography align={'center'}>
                  <a href={'https://up209d.github.io/UPPortfolio'} target={'_blank'}>
                    <Button className={utils.toggleClassNames([classes.button,'contact'])} variant="flat">
                      My Homepage
                    </Button>
                  </a>
                  <a href={'mailto: up209d@gmail.com'} target={'_blank'}>
                    <Button className={utils.toggleClassNames([classes.button,'contact'])} variant="flat">
                      Contact me
                    </Button>
                  </a>
                </Typography>
              </Fade>
            )
          }
        </Grid>
      </Grid>
    )
  }
};

export default utils.getConnectAllStateActions(withStyles(style,{withTheme: true})(TypoRenderer));
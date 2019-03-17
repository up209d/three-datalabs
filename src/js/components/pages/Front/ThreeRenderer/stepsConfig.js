import {easing} from 'popmotion';

export default {
  camera: {
    position: {
      z: {
        defaultValue:
            { value: 0.01,  delay: 0, config: { duration: 1000 } },
        1:  { value: 1100,  delay: 0, config: { duration: 10000 } },
        2:  { value: 0.01,  delay: 0, config: { duration: 1000 } },
        3:  { value: 2200,  delay: 0, config: { duration: 3000 } },
        4:  { value: 100,   delay: 0, config: { duration: 3000 } },
      }
    }
  },
  cloudMaterial: {
    uniforms: {
      rotationSpeed: {
        value: {
          defaultValue:
              { value: 0.0,   delay: 0,     config: { duration:  1000 } },
          1:  { value: 0.35,  delay: 0,     config: { duration: 30000 } },
          2:  { value: 0.125, delay: 0,     config: { duration: 10000 } },
          3:  { value: 0.0,   delay: 0,     config: { duration:  2000 } },
          4:  { value: 0.25,  delay: 2000,  config: { duration:  5000, ease: easing.easeInOut } },
        }
      },
      pointOpacity: {
        value: {
          defaultValue:
              { value: 0.5,   delay: 0, config: { duration:  1000 } },
          1:  { value: 1.0,   delay: 0, config: { duration: 10000 } },
          2:  { value: 0.5,   delay: 0, config: { duration: 10000 } },
          3:  { value: 1.0,   delay: 0, config: { duration:  5000 } },
          4:  { value: 0.85,  delay: 0, config: { duration:  5000 } },
        }
      },
      lineOpacity: {
        value: {
          defaultValue:
              { value: 0.0,   delay: 0, config: { duration:  1000 } },
          1:  { value: 1.0,   delay: 0, config: { duration: 10000 } },
          2:  { value: 0.5,   delay: 0, config: { duration: 10000 } },
          3:  { value: 0.0,   delay: 0, config: { duration:  5000 } },
          4:  { value: 0.85,  delay: 0, config: { duration:  5000 } },
        }
      },
      size: {
        value: {
          defaultValue:
              { value: 28,  delay: 0, config: { duration:  1000 } },
          1:  { value: 20,   delay: 0, config: { duration: 10000 } },
          2:  { value: 32,  delay: 0, config: { duration:  1000 } },
          3:  { value: 12,   delay: 0, config: { duration:  5000 } },
          4:  { value: 4,   delay: 0, config: { duration:  5000 } },
        }
      },
      step1: {
        value: {
          defaultValue:
              { value: 0.1, delay: 0, config:   { duration:  1000 } },
          1:  { value: 0.5,   delay: 0, config:   { duration: 20000 } },
          2:  { value: 0.8, delay: 0, config:   { duration:  1000 } },
          3:  { value: 3.0,  delay: 0, config:   { duration: 30000 } },
          4:  { value: 0.8,  delay: 0, config:  { duration: 30000 } },
        }
      },
      step2: {
        value: {
          defaultValue:
              { value: 0, delay: 0,   config: { duration: 1000 } },
          1:  { value: 1, delay: 650, config: { duration: 8000 } },
          2:  { value: 0, delay: 0,   config: { duration: 1000 } },
          3:  { value: 0, delay: 0,   config: { duration: 8000 } },
          4:  { value: 0, delay: 0,   config: { duration: 8000 } },
        }
      },
      step3: {
        value: {
          defaultValue:
              { value: 0, delay: 0, config: { duration: 1000 } },
          1:  { value: 0, delay: 0, config: { duration: 1000 } },
          2:  { value: 0, delay: 0, config: { duration: 1000 } },
          3:  { value: 1, delay: 0, config: { duration: 4000 } },
          4:  { value: 0, delay: 0, config: { duration: 4000 } },
        }
      }
    }
  }
};
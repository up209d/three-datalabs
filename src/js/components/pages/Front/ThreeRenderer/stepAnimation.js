import * as POP from 'popmotion';
import utils from 'js/utils';

let animationHandlers = {};

export const registerAnimation = (handler) => {
  animationHandlers['animation-' + utils.uniqueId()] = handler;
  return !!handler;
};

export const clearAllAnimations = () => {
  let count = 0;
  utils.forIn(animationHandlers,value => {
    if (value.stop) value.stop();
    count++;
  });
  animationHandlers = {};
  return count > 0;
};

export const createAnimations = (options = { ease: POP.easing.easeOut }) => {
  let index = 0;
  let animationGenerator = function(object,stepsConfig,stepIndex = 0) {
    let allAnimations = [];
    Object.keys(stepsConfig).forEach(key => {
      if (typeof object[key] !== 'undefined') {
        if (stepsConfig[key].defaultValue) {
          let currentValue = stepsConfig[key][stepIndex] || stepsConfig[key].defaultValue;
          allAnimations.push(
            {
              index,
              object: object,
              key: key,
              animation: currentValue.delay ? POP.chain(
                POP.delay(currentValue.delay),
                POP.tween({
                  from: object[key],
                  to: currentValue.value,
                  ...options,
                  ...currentValue.config
                })
              ) : POP.chain(
                POP.tween({
                  from: object[key],
                  to: currentValue.value,
                  ...options,
                  ...currentValue.config
                })
              )
            }
          );
          index++;
        } else {
          allAnimations = allAnimations.concat(animationGenerator(object[key],stepsConfig[key],stepIndex));
        }
      }
    });
    return allAnimations;
  };
  return animationGenerator;
};

export const doAnimations = (object,stepsConfig,stepIndex,options) => {
  clearAllAnimations();
  let allAnimations = createAnimations(options)(object,stepsConfig,stepIndex);
  registerAnimation(
    POP.parallel(
      ...allAnimations.map(a => {
      return a.animation;
      })
    ).start(i => {
      allAnimations.forEach(({ object,key,index }) => {
        if (i[index]) {
          object[key] = i[index];
        }
      })
    })
  );
};

export default doAnimations;
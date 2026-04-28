import { Easing } from 'react-native';

export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    stagger: 80,
  },

  easing: {
    enter: Easing.out(Easing.cubic),
    exit: Easing.in(Easing.cubic),
    move: Easing.inOut(Easing.cubic),
    bounce: Easing.bounce,
  },

  enterOffset: 20,
  scaleFrom: 0.95,
};

import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface Props {
  primary: string;
  accent: string;
  size?: number;
}

const CONFETTI = ['#F06AA6', '#F2C14E', '#6BCB77', '#4D96FF', '#E87A3E', '#B983FF'];

/**
 * Comemoração 100% desenhada/animada: medalha SVG que "estoura" com mola
 * e confete disparado do centro. Nada de imagem estática.
 */
export function Celebration({ primary, accent, size = 168 }: Props) {
  const pop = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(0)).current;

  const pieces = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 22 + Math.random() * 0.5;
        const dist = 90 + Math.random() * 90;
        return {
          v: new Animated.Value(0),
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist + 40,
          color: CONFETTI[i % CONFETTI.length],
          w: 7 + Math.random() * 7,
          h: 10 + Math.random() * 10,
          delay: Math.random() * 500,
          duration: 1400 + Math.random() * 900,
          spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360),
        };
      }),
    [],
  );

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(shine, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shine, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
    pieces.forEach((p) => {
      Animated.loop(
        Animated.timing(p.v, {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const medalRotate = pop.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '0deg'] });
  const shineOpacity = shine.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.5] });

  return (
    <View style={[styles.wrap, { height: size + 96 }]} pointerEvents="none">
      {pieces.map((p, i) => {
        const translateX = p.v.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] });
        const translateY = p.v.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] });
        const rotate = p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] });
        const opacity = p.v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                width: p.w,
                height: p.h,
                backgroundColor: p.color,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
              },
            ]}
          />
        );
      })}

      <Animated.View style={{ transform: [{ scale }, { rotate: medalRotate }] }}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="ribbon" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={accent} />
              <Stop offset="1" stopColor={primary} />
            </LinearGradient>
            <LinearGradient id="disc" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFE08A" />
              <Stop offset="1" stopColor="#F2A93B" />
            </LinearGradient>
          </Defs>

          {/* fitas */}
          <Path d="M35 40 L22 82 L37 74 L42 58 Z" fill="url(#ribbon)" />
          <Path d="M65 40 L78 82 L63 74 L58 58 Z" fill="url(#ribbon)" />

          {/* disco da medalha */}
          <Circle cx="50" cy="40" r="30" fill="url(#disc)" stroke="#E0912B" strokeWidth="2.5" />
          <Circle cx="50" cy="40" r="23" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.5" />

          {/* estrela central */}
          <Path
            d="M50 22 L55.9 34.9 L70 36.5 L59.5 46.1 L62.4 60 L50 53 L37.6 60 L40.5 46.1 L30 36.5 L44.1 34.9 Z"
            fill="#FFFFFF"
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.glow, { backgroundColor: accent, opacity: shineOpacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  confetti: { position: 'absolute', top: '42%', borderRadius: 2 },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    zIndex: -1,
    top: '10%',
  },
});

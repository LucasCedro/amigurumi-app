import { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size: number;
  progress: number; // 0..1
  color: string;
  trackColor: string;
  strokeWidth?: number;
  turns?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Espiral que se revela conforme o progresso — cresce do centro (anel mágico)
 * pra fora, imitando o amigurumi sendo construído em espiral.
 */
export function SpiralProgress({
  size,
  progress,
  color,
  trackColor,
  strokeWidth = 8,
  turns = 4.5,
  children,
  style,
}: Props) {
  const { d, length } = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - strokeWidth;
    const steps = 360;
    const pts: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const theta = t * turns * Math.PI * 2;
      const r = maxR * t;
      pts.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
    }
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    }
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
    return { d: path, length: len };
  }, [size, strokeWidth, turns]);

  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[{ width: size, height: size }, styles.wrap, style]}>
      <Svg width={size} height={size}>
        <Path d={d} stroke={trackColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        <Path
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - clamped)}
        />
      </Svg>
      {children != null && <View style={styles.center}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

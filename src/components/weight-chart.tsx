import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { dateFromKey } from '@/data/storage';
import { useTheme } from '@/hooks/use-theme';

type Point = { date: string; lb: number };

const HEIGHT = 180;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

/** Simple line chart of weigh-ins over time, with the goal as a dashed line and a 0.75 lb/week pace line */
export function WeightChart({ points, goal, paceStart }: { points: Point[]; goal?: number; paceStart?: Point }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  if (points.length < 2) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
        {points.length === 0 ? 'Log your first weigh-in to start the chart.' : 'One more weigh-in and the line appears.'}
      </ThemedText>
    );
  }

  const paceEndLb = paceStart ? paceStart.lb - (0.75 * (dateFromKey(points[points.length - 1].date).getTime() - dateFromKey(paceStart.date).getTime())) / (7 * 86_400_000) : undefined;
  const values = points.map((p) => p.lb).concat(goal ? [goal] : [], paceEndLb !== undefined ? [paceEndLb] : []);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);
  const t0 = dateFromKey(points[0].date).getTime();
  const t1 = dateFromKey(points[points.length - 1].date).getTime();
  const span = Math.max(t1 - t0, 1);

  const plotW = Math.max(width - PAD.left - PAD.right, 1);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (date: string) => PAD.left + ((dateFromKey(date).getTime() - t0) / span) * plotW;
  const y = (lb: number) => PAD.top + ((max - lb) / (max - min)) * plotH;

  const coords = points.map((p) => `${x(p.date)},${y(p.lb)}`).join(' ');
  const label = (d: string) => dateFromKey(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={styles.wrap}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          {[max, Math.round((max + min) / 2), min].map((v) => (
            <Line
              key={v}
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(v)}
              y2={y(v)}
              stroke={theme.border}
              strokeWidth={StyleSheet.hairlineWidth}
            />
          ))}
          {[max, Math.round((max + min) / 2), min].map((v) => (
            <SvgText key={`t${v}`} x={PAD.left - 6} y={y(v) + 4} fontSize={11} fill={theme.textSecondary} textAnchor="end">
              {v}
            </SvgText>
          ))}
          {goal && goal >= min && goal <= max && (
            <Line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(goal)}
              y2={y(goal)}
              stroke={theme.accent}
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
          )}
          {paceStart && paceEndLb !== undefined && (
            <Line
              x1={x(paceStart.date)}
              y1={y(paceStart.lb)}
              x2={x(points[points.length - 1].date)}
              y2={y(paceEndLb)}
              stroke={theme.textSecondary}
              strokeWidth={1}
              strokeDasharray="2 4"
            />
          )}
          <Polyline points={coords} fill="none" stroke={theme.accent} strokeWidth={2.5} strokeLinejoin="round" />
          {points.map((p) => (
            <Circle key={p.date} cx={x(p.date)} cy={y(p.lb)} r={4} fill={theme.accent} />
          ))}
          <SvgText x={PAD.left} y={HEIGHT - 8} fontSize={11} fill={theme.textSecondary}>
            {label(points[0].date)}
          </SvgText>
          <SvgText x={width - PAD.right} y={HEIGHT - 8} fontSize={11} fill={theme.textSecondary} textAnchor="end">
            {label(points[points.length - 1].date)}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  empty: { paddingVertical: Spacing.three },
});

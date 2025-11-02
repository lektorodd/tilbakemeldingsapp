import React from 'react';
import { OralFeedbackDimension } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface RadarChartProps {
  dimensions: OralFeedbackDimension[];
  width?: number;
  height?: number;
  maxValue?: number;
}

export default function RadarChart({ dimensions, width = 300, height = 250, maxValue = 6 }: RadarChartProps) {
  const { t } = useLanguage();

  // Sort dimensions in a consistent order for the radar chart
  const dimensionOrder = ['strategy', 'reasoning', 'representations', 'modeling', 'communication', 'subject_knowledge'];
  const emojis = ['🎯', '💭', '📊', '⚙️', '💬', '📚'];

  const sortedDimensions = dimensionOrder.map(dimType => {
    const dimension = dimensions.find(d => d.dimension === dimType);
    return dimension || { dimension: dimType as any, points: 0, comment: '' };
  });

  const numDimensions = sortedDimensions.length;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 35; // Less margin needed for letter labels

  // Calculate points for each dimension
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numDimensions - Math.PI / 2; // Start from top
    const distance = (value / maxValue) * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    return { x, y };
  };

  // Generate polygon points for the data
  const dataPoints = sortedDimensions.map((dim, index) => getPoint(index, dim.points));
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Generate grid circles (for 0, 2, 4, 6)
  const gridLevels = [2, 4, 6];

  // Generate axis lines and labels
  const axes = sortedDimensions.map((dim, index) => {
    const endPoint = getPoint(index, maxValue);
    const labelPoint = getPoint(index, maxValue + 0.6); // Closer to chart with emoji labels

    return {
      line: { x1: centerX, y1: centerY, x2: endPoint.x, y2: endPoint.y },
      label: { x: labelPoint.x, y: labelPoint.y, text: emojis[index] },
      value: dim.points,
    };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
      {/* Grid circles */}
      {gridLevels.map(level => (
        <circle
          key={level}
          cx={centerX}
          cy={centerY}
          r={(level / maxValue) * radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axes.map((axis, index) => (
        <line
          key={`axis-${index}`}
          x1={axis.line.x1}
          y1={axis.line.y1}
          x2={axis.line.x2}
          y2={axis.line.y2}
          stroke="#d1d5db"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="rgba(147, 51, 234, 0.25)"
        stroke="rgb(147, 51, 234)"
        strokeWidth="2"
      />

      {/* Data points */}
      {dataPoints.map((point, index) => (
        <circle
          key={`point-${index}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="rgb(147, 51, 234)"
        />
      ))}

      {/* Axis labels and values */}
      {axes.map((axis, index) => {
        // Calculate text anchor based on position
        const angle = (Math.PI * 2 * index) / numDimensions - Math.PI / 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        if (cos > 0.1) textAnchor = 'start';
        else if (cos < -0.1) textAnchor = 'end';

        return (
          <g key={`label-${index}`}>
            {/* Emoji label */}
            <text
              x={axis.label.x}
              y={axis.label.y}
              textAnchor="middle"
              fontSize="20"
              dominantBaseline="middle"
            >
              {axis.label.text}
            </text>
            {/* Point value below */}
            <text
              x={axis.label.x}
              y={axis.label.y + 22}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#7c3aed"
              dominantBaseline="middle"
            >
              {axis.value}/6
            </text>
          </g>
        );
      })}

      {/* Center point */}
      <circle cx={centerX} cy={centerY} r="2" fill="#9ca3af" />

      {/* Grid level labels */}
      <text x={centerX} y={centerY - (2 / maxValue) * radius} fontSize="8" fill="#9ca3af" textAnchor="middle" dy="-2">2</text>
      <text x={centerX} y={centerY - (4 / maxValue) * radius} fontSize="8" fill="#9ca3af" textAnchor="middle" dy="-2">4</text>
      <text x={centerX} y={centerY - (6 / maxValue) * radius} fontSize="8" fill="#9ca3af" textAnchor="middle" dy="-2">6</text>
    </svg>
  );
}

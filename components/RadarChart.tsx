import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { OralFeedbackDimension } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface GenericRadarData {
  label: string;
  value: number;
  emoji?: string;
}

interface RadarChartProps {
  dimensions?: OralFeedbackDimension[];
  genericData?: GenericRadarData[];
  width?: number;
  height?: number;
  maxValue?: number;
  color?: string; // CSS color for the polygon, defaults to indigo
}

export interface RadarChartRef {
  exportToPNG: () => Promise<string>;
}

const RadarChart = forwardRef<RadarChartRef, RadarChartProps>(({ dimensions, genericData, width = 300, height = 250, maxValue = 6, color }, ref) => {
  const { t } = useLanguage();
  const svgRef = useRef<SVGSVGElement>(null);

  const fillColor = color || 'rgba(79, 70, 229, 0.2)';
  const strokeColor = color ? color.replace(/[\d.]+\)$/, '1)') : 'rgb(79, 70, 229)';
  const dotColor = color ? strokeColor : 'rgb(79, 70, 229)';
  const textColor = color ? strokeColor : '#4F46E5';

  useImperativeHandle(ref, () => ({
    exportToPNG: async (): Promise<string> => {
      if (!svgRef.current) {
        throw new Error('SVG ref not available');
      }

      return new Promise((resolve, reject) => {
        const svg = svgRef.current!;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Use 3x scale for high resolution export
        const scale = 3;
        canvas.width = width * scale;
        canvas.height = height * scale;
        ctx.scale(scale, scale);

        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG'));
        };

        img.src = url;
      });
    },
  }));

  // Build unified data array from either source
  let chartData: { label: string; emoji: string; value: number }[];

  if (genericData && genericData.length > 0) {
    // Generic mode: use provided labels
    const defaultEmojis = ['📋', '📊', '🔬', '🎯', '📝', '💡', '⚙️', '📐', '🧪', '🎨'];
    chartData = genericData.map((d, i) => ({
      label: d.label,
      emoji: d.emoji || defaultEmojis[i % defaultEmojis.length],
      value: d.value,
    }));
  } else if (dimensions && dimensions.length > 0) {
    // Oral assessment mode: use hardcoded dimension order
    const dimensionOrder = ['strategy', 'reasoning', 'representations', 'modeling', 'communication', 'subject_knowledge'];
    const emojis = ['🎯', '💭', '📊', '⚙️', '💬', '📚'];

    chartData = dimensionOrder.map((dimType, i) => {
      const dimension = dimensions.find(d => d.dimension === dimType);
      return {
        label: dimType,
        emoji: emojis[i],
        value: dimension?.points || 0,
      };
    });
  } else {
    return null;
  }

  const numDimensions = chartData.length;
  if (numDimensions < 3) return null; // Need at least 3 points for a polygon

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 35;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numDimensions - Math.PI / 2;
    const distance = (value / maxValue) * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    return { x, y };
  };

  const dataPoints = chartData.map((d, index) => getPoint(index, d.value));
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
  const gridLevels = [2, 4, 6];

  const axes = chartData.map((d, index) => {
    const endPoint = getPoint(index, maxValue);
    const labelPoint = getPoint(index, maxValue + 0.6);
    return {
      line: { x1: centerX, y1: centerY, x2: endPoint.x, y2: endPoint.y },
      label: { x: labelPoint.x, y: labelPoint.y, text: d.emoji },
      value: d.value,
    };
  });

  return (
    <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
      {/* Grid circles */}
      {gridLevels.map(level => (
        <circle
          key={level}
          cx={centerX}
          cy={centerY}
          r={(level / maxValue) * radius}
          fill="none"
          stroke="#E2E8F0"
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
          stroke="#CBD5E1"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="2"
      />

      {/* Data points */}
      {dataPoints.map((point, index) => (
        <circle
          key={`point-${index}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={dotColor}
        />
      ))}

      {/* Axis labels and values */}
      {axes.map((axis, index) => {
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
              fill={textColor}
              dominantBaseline="middle"
            >
              {axis.value}/{maxValue}
            </text>
          </g>
        );
      })}

      {/* Center point */}
      <circle cx={centerX} cy={centerY} r="2" fill="#94A3B8" />

      {/* Grid level labels */}
      <text x={centerX} y={centerY - (2 / maxValue) * radius} fontSize="8" fill="#94A3B8" textAnchor="middle" dy="-2">2</text>
      <text x={centerX} y={centerY - (4 / maxValue) * radius} fontSize="8" fill="#94A3B8" textAnchor="middle" dy="-2">4</text>
      <text x={centerX} y={centerY - (6 / maxValue) * radius} fontSize="8" fill="#94A3B8" textAnchor="middle" dy="-2">6</text>
    </svg>
  );
});

RadarChart.displayName = 'RadarChart';

export default RadarChart;

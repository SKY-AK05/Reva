'use client';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import type { GenerateChartFromTextOutput } from '@/ai/flows/generate-chart-from-text';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';

interface NoteChartProps {
  chartData: GenerateChartFromTextOutput;
  onClear: () => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

export default function NoteChart({ chartData, onClear }: NoteChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const downloadChart = useCallback(() => {
    if (chartRef.current === null) {
      return;
    }

    toPng(chartRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${chartData.title || 'chart'}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to download chart', err);
      });
  }, [chartRef, chartData.title]);

  const renderChart = () => {
    if (!chartData.chartType || !chartData.data) return null;

    switch (chartData.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {chartData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <p className="text-destructive">Unsupported chart type: {chartData.chartType}</p>;
    }
  };

  return (
    <Card className="mt-6 animate-fade-in-up" ref={chartRef}>
      <CardHeader>
        <CardTitle>{chartData.title || 'Generated Chart'}</CardTitle>
        <CardDescription>Generated from your selected text.</CardDescription>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" onClick={onClear}>Clear</Button>
        <Button onClick={downloadChart}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}

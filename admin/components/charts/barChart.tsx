'use client';
import { Chart as ChartJS, ArcElement } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
ChartJS.register(ArcElement);

interface ChartProp {
  data: any;
}

const options = {
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

export default function BarChart({ data }: ChartProp) {
  return <Bar options={options} data={data}></Bar>;
}

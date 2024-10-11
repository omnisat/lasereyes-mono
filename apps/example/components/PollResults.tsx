'use client'

import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartConfig = {
  oyl: {
    label: 'OYL',
    color: 'hsl(var(--chart-5))',
  },
  'orange-wallet': {
    label: 'ORANGE WALLET',
    color: 'hsl(var(--chart-1))',
  },
  leather: {
    label: 'LEATHER',
    color: 'hsl(var(--chart-2))',
  },
  wiz: {
    label: 'WIZ',
    color: 'hsl(var(--chart-3))',
  },
  'magic-eden': {
    label: 'MAGIC EDEN',
    color: 'hsl(var(--chart-4))',
  },
  phantom: {
    label: 'PHANTOM',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig

export function PollResults({ pollResults }: { pollResults: any[] }) {
  const chartData = pollResults
    // @ts-ignore
    .filter((res) => chartConfig[res.wallet.toLowerCase().replace(' ', '-')])
    .map((result) => ({
      wallet: result.wallet.toLowerCase().replace(' ', '-'),
      votes: result.votes,
      //@ts-ignore
      fill: chartConfig[result.wallet.toLowerCase().replace(' ', '-')]
        ?.color as string,
    }))

  return (
    <ChartContainer
      config={chartConfig}
      className={'w-[200px] text-white h-[200px]'}
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        className={'h-full text-white'}
        margin={{}}
      >
        <YAxis
          dataKey="wallet"
          type="category"
          tickLine={false}
          fontSize={12}
          tickMargin={10}
          color={'#FFFFFF'}
          axisLine={false}
          className={'font-black text-white'}
          tickFormatter={(value) =>
            chartConfig[value as keyof typeof chartConfig]?.label
          }
        />
        <XAxis dataKey="votes" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="votes" layout="vertical" radius={5} />
      </BarChart>
    </ChartContainer>
  )
}

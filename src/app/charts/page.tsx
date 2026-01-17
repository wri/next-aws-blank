'use client'
import { Chart, useChart } from '@chakra-ui/charts'
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  TooltipContentProps,
} from 'recharts'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import {
  getThemedColor,
  QualitativeAttribute,
} from '@worldresources/wri-design-systems'

function CustomTooltip(
  props: Partial<TooltipContentProps<string, string>> & { darkMode?: boolean },
) {
  const { active, payload, label, darkMode = false } = props

  if (!active || !payload || payload.length === 0) return null

  const bgColor = darkMode
    ? getThemedColor('neutral', 900)
    : getThemedColor('neutral', 100)
  const textColor = darkMode ? 'white' : 'inherit'
  const borderColor = darkMode ? 'whiteAlpha.300' : 'transparent'

  return (
    <Box
      w='40'
      rounded='lg'
      bg={bgColor}
      p='3'
      border='1px solid'
      borderColor={borderColor}
    >
      <HStack align='flex-start'>
        <p className={`text-lg mb-2 ${darkMode ? 'text-white' : ''}`}>
          {label}
        </p>
      </HStack>
      <Stack>
        {payload.map((item) => (
          <HStack
            key={item.name}
            flex='1'
            justify='space-between'
            align='flex-start'
          >
            <QualitativeAttribute
              color={item.color}
              label={<span style={{ color: textColor }}>{item.name}</span>}
              onActionClick={() => {}}
              type='raster'
            />
            <Text textStyle='md' color={textColor}>
              {item.value}
            </Text>
          </HStack>
        ))}
      </Stack>
    </Box>
  )
}

const Charts = () => {
  const chart = useChart({
    data: [
      { label1: 186, label2: 165, label3: 170, month: 'January' },
      { label1: 165, label2: 155, label3: 160, month: 'February' },
      { label1: 190, label2: 175, label3: 180, month: 'March' },
      { label1: 195, label2: 180, label3: 185, month: 'May' },
      { label1: 182, label2: 170, label3: 175, month: 'June' },
      { label1: 175, label2: 160, label3: 155, month: 'August' },
      { label1: 180, label2: 165, label3: 170, month: 'October' },
      { label1: 185, label2: 170, label3: 175, month: 'November' },
    ],
    series: [
      { name: 'label1', color: '#FFC506' },
      { name: 'label2', color: '#298ED2' },
      { name: 'label3', color: '#18CD49', strokeDasharray: '5 5' },
    ],
  })

  return (
    <>
      <div className='h-full w-full relative h-12 w-full p-12 gap-8 flex items-center justify-between'>
        <p className='text-3xl font-bold mb-2'>Chart container</p>

        <div
          className='w-full h-120'
          style={{
            background: getThemedColor('neutral', 200),
            borderRadius: '16px',
          }}
        >
          <Chart.Root maxH='sm' chart={chart}>
            <LineChart
              data={chart.data}
              margin={{ left: 40, right: 40, top: 40 }}
            >
              <CartesianGrid
                stroke={chart.color('border')}
                strokeDasharray='3 3'
              />
              <XAxis
                dataKey={chart.key('month')}
                tickFormatter={(value) => value.slice(0, 3)}
                stroke={chart.color('border')}
              />
              <YAxis
                dataKey={chart.key('label1')}
                stroke={chart.color('border')}
                domain={[140, 'dataMax']}
              />
              <Tooltip
                animationDuration={100}
                cursor={{ stroke: chart.color('border') }}
                content={<Chart.Tooltip hideLabel />}
              />
            </LineChart>
          </Chart.Root>

          <div className='flex justify-center items-center gap-8 mt-4'>
            <div className='flex justify-center items-center'>
              <QualitativeAttribute
                color='#FFC506'
                label='Label'
                onActionClick={() => {}}
                type='raster'
              />
            </div>
            <div className='flex justify-center items-center'>
              <QualitativeAttribute
                color='#298ED2'
                label='Label'
                onActionClick={() => {}}
                type='raster'
              />
            </div>
            <div className='flex justify-center items-center'>
              <QualitativeAttribute
                color='#18CD49'
                label='Label'
                onActionClick={() => {}}
                type='raster'
              />
            </div>
          </div>
        </div>
        <div
          className='w-full h-120'
          style={{
            background: getThemedColor('neutral', 200),
            borderRadius: '16px',
          }}
        >
          <Chart.Root maxH='sm' chart={chart}>
            <LineChart
              data={chart.data}
              margin={{ top: 40, right: 40, left: 40, bottom: 40 }}
            >
              <CartesianGrid
                stroke={chart.color('border')}
                strokeDasharray='3 3'
              />

              <XAxis
                dataKey={chart.key('month')}
                tickFormatter={(value) => value.slice(0, 3)}
                stroke={chart.color('border')}
                label={{
                  value: 'X axis title',
                  position: 'insideBottom',
                  offset: -10,
                }}
              />

              <YAxis
                dataKey={chart.key('label2')}
                stroke={chart.color('border')}
                domain={[140, 'dataMax']}
                label={{
                  value: 'Y axis title',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                }}
              />

              <Tooltip
                animationDuration={100}
                cursor={{ stroke: chart.color('border') }}
                content={<Chart.Tooltip hideLabel />}
              />
            </LineChart>
          </Chart.Root>

          <div className='flex justify-center items-center gap-8 mt-4'>
            <div className='flex justify-center items-center'>
              <QualitativeAttribute
                color='#FFC506'
                label='Label'
                onActionClick={() => {}}
                type='raster'
              />
            </div>
            <div className='flex justify-center items-center'>
              <QualitativeAttribute
                color='#298ED2'
                label='Label'
                onActionClick={() => {}}
                type='raster'
              />
            </div>
            <div className='flex justify-center items-center'>
              <QualitativeAttribute
                color='#18CD49'
                label='Label'
                onActionClick={() => {}}
                type='raster'
              />
            </div>
          </div>
        </div>
      </div>

      <div className='h-full w-full relative h-12 w-full p-12 gap-8 flex items-center justify-between'>
        <p className='text-3xl font-bold mb-2'>Line Charts</p>

        <Chart.Root
          maxH='sm'
          style={{
            background: getThemedColor('neutral', 200),
            borderRadius: '16px',
          }}
          chart={chart}
        >
          <LineChart
            data={chart.data}
            margin={{ left: 40, right: 40, top: 40 }}
          >
            <CartesianGrid
              stroke={chart.color('border')}
              strokeDasharray='3 3'
              horizontal={false}
            />
            <XAxis
              tick={false}
              dataKey={chart.key('month')}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke={chart.color('border')}
            />
            <YAxis
              tick={false}
              dataKey={chart.key('label1')}
              stroke={chart.color('border')}
              domain={[140, 'dataMax']}
            />
            <Tooltip
              animationDuration={100}
              cursor={{ stroke: chart.color('border') }}
              content={<Chart.Tooltip hideLabel />}
            />
            {chart.series.map((item) => (
              <Line
                key={item.name}
                isAnimationActive={false}
                dataKey={chart.key(item.name)}
                stroke={chart.color(item.color)}
                fill={chart.color(item.color)}
                dot={{ strokeDasharray: '0' }}
                strokeWidth={2}
                strokeDasharray={item.strokeDasharray}
              />
            ))}
          </LineChart>
        </Chart.Root>
        <Chart.Root
          maxH='sm'
          style={{
            background: getThemedColor('neutral', 200),
            borderRadius: '16px',
          }}
          chart={chart}
        >
          <LineChart
            data={chart.data}
            margin={{ left: 40, right: 40, top: 40 }}
          >
            <CartesianGrid
              stroke={chart.color('border')}
              strokeDasharray='3 3'
              horizontal={false}
            />
            <XAxis
              tick={false}
              dataKey={chart.key('month')}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke={chart.color('border')}
            />
            <YAxis
              tick={false}
              dataKey={chart.key('label2')}
              stroke={chart.color('border')}
              domain={[140, 'dataMax']}
            />
            <Tooltip
              animationDuration={100}
              cursor={{ stroke: chart.color('border') }}
              content={<Chart.Tooltip hideLabel />}
            />

            <Line
              key='label2'
              isAnimationActive={false}
              dataKey={chart.key('label2')}
              stroke={chart.color('#298ED2')}
              strokeWidth={2}
              strokeDasharray='5 5'
            />
            <Line
              key='label3'
              isAnimationActive={false}
              dataKey={chart.key('label3')}
              stroke={chart.color('#18CD49')}
              strokeWidth={2}
              strokeDasharray='2 4'
            />
          </LineChart>
        </Chart.Root>
      </div>
      <div className='h-full w-full relative h-12 w-full p-12 gap-8 flex items-center justify-between'>
        <p className='text-3xl font-bold mb-2'>Bar Charts</p>
        <Chart.Root
          maxH='sm'
          style={{
            background: getThemedColor('neutral', 200),
            borderRadius: '16px',
            marginTop: '24px',
          }}
          chart={chart}
        >
          <BarChart data={chart.data} margin={{ left: 40, right: 40, top: 40 }}>
            <CartesianGrid
              stroke={chart.color('border')}
              strokeDasharray='3 3'
              vertical={false}
            />

            <XAxis
              tick={false}
              dataKey={chart.key('month')}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke={chart.color('border')}
            />

            <YAxis
              tick={false}
              stroke={chart.color('border')}
              domain={[140, 'dataMax']}
            />

            <Tooltip
              cursor={{ fill: chart.color('border') }}
              content={<Chart.Tooltip hideLabel />}
            />

            {chart.series.map((item) => (
              <Bar
                key={item.name}
                dataKey={chart.key(item.name)}
                fill={chart.color(item.color)}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        </Chart.Root>

        <Chart.Root
          maxH='sm'
          style={{
            background: getThemedColor('neutral', 200),
            borderRadius: '16px',
            marginTop: '24px',
          }}
          chart={chart}
        >
          <BarChart data={chart.data} margin={{ left: 40, right: 40, top: 40 }}>
            <CartesianGrid
              stroke={chart.color('border')}
              strokeDasharray='3 3'
              vertical={false}
            />
            <XAxis
              tick={false}
              dataKey={chart.key('month')}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke={chart.color('border')}
            />
            <YAxis tick={false} stroke={chart.color('border')} />
            <Tooltip
              cursor={{ fill: chart.color('border') }}
              content={<Chart.Tooltip hideLabel />}
            />

            {chart.series.map((item, index) => (
              <Bar
                key={item.name}
                dataKey={chart.key(item.name)}
                fill={chart.color(item.color)}
                stackId='total'
                radius={
                  index === chart.series.length - 1
                    ? [6, 6, 0, 0]
                    : [0, 0, 0, 0]
                }
              />
            ))}
          </BarChart>
        </Chart.Root>
      </div>

      <div className='h-full w-full relative h-12 w-full p-12 gap-8 flex items-center justify-between'>
        <p className='text-3xl font-bold mb-2'>Custom Tooltip</p>
        <Chart.Root
          maxH='sm'
          style={{
            background: getThemedColor('neutral', 200),
            borderRadius: '16px',
          }}
          chart={chart}
        >
          <LineChart
            data={chart.data}
            margin={{ left: 40, right: 40, top: 40 }}
          >
            <CartesianGrid
              stroke={chart.color('border')}
              strokeDasharray='3 3'
              horizontal={false}
            />
            <XAxis
              tick={false}
              dataKey={chart.key('month')}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke={chart.color('border')}
            />
            <YAxis
              tick={false}
              dataKey={chart.key('label2')}
              stroke={chart.color('border')}
              domain={[140, 'dataMax']}
            />
            <Tooltip
              animationDuration={100}
              cursor={{ stroke: chart.color('border') }}
              content={<CustomTooltip />}
            />

            <Line
              key='label2'
              isAnimationActive={false}
              dataKey={chart.key('label2')}
              stroke={chart.color('#298ED2')}
              strokeWidth={2}
              strokeDasharray='5 5'
            />
            <Line
              key='label3'
              isAnimationActive={false}
              dataKey={chart.key('label3')}
              stroke={chart.color('#18CD49')}
              strokeWidth={2}
              strokeDasharray='2 4'
            />
          </LineChart>
        </Chart.Root>
        <Chart.Root
          maxH='sm'
          style={{
            background: getThemedColor('neutral', 200),
            borderRadius: '16px',
          }}
          chart={chart}
        >
          <LineChart
            data={chart.data}
            margin={{ left: 40, right: 40, top: 40 }}
          >
            <CartesianGrid
              stroke={chart.color('border')}
              strokeDasharray='3 3'
              horizontal={false}
            />
            <XAxis
              tick={false}
              dataKey={chart.key('month')}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke={chart.color('border')}
            />
            <YAxis
              tick={false}
              dataKey={chart.key('label1')}
              stroke={chart.color('border')}
              domain={[140, 'dataMax']}
            />
            <Tooltip
              animationDuration={100}
              cursor={{ stroke: chart.color('border') }}
              content={<CustomTooltip darkMode />}
            />
            {chart.series.map((item) => (
              <Line
                key={item.name}
                isAnimationActive={false}
                dataKey={chart.key(item.name)}
                stroke={chart.color(item.color)}
                fill={chart.color(item.color)}
                dot={{ strokeDasharray: '0' }}
                strokeWidth={2}
                strokeDasharray={item.strokeDasharray}
              />
            ))}
          </LineChart>
        </Chart.Root>
      </div>
    </>
  )
}

export default Charts

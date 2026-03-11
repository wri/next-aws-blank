'use client'

import {
  DatePickerContent,
  DatePickerControl,
  DatePickerDayTable,
  DatePickerHeader,
  DatePickerIndicatorGroup,
  DatePickerInput,
  DatePickerMonthTable,
  DatePickerPositioner,
  DatePickerRoot,
  DatePickerTrigger,
  DatePickerView,
  DatePickerYearTable,
  Portal,
  parseDate,
} from '@chakra-ui/react'
import { CalendarIcon } from '../icons'

const DatePicker = ({
  defaultValue,
  onChange,
}: {
  defaultValue: string
  onChange: (value: string) => void
}) => {
  return (
    <DatePickerRoot
      min={parseDate(new Date())}
      defaultValue={
        defaultValue?.length > 0 ? [parseDate(defaultValue)] : undefined
      }
      onValueChange={(e) => {
        const newDeadline = e.valueAsString.join(', ')
        const [month, day, year] = newDeadline?.split('/')
        const newDeadlineFormatted = `${year}-${month}-${day}`

        onChange(newDeadlineFormatted)
      }}
      openOnClick
    >
      <DatePickerControl>
        <DatePickerInput />
        <DatePickerIndicatorGroup>
          <DatePickerTrigger>
            <CalendarIcon />
          </DatePickerTrigger>
        </DatePickerIndicatorGroup>
      </DatePickerControl>
      <Portal>
        <DatePickerPositioner>
          <DatePickerContent>
            <DatePickerView view='day'>
              <DatePickerHeader />
              <DatePickerDayTable />
            </DatePickerView>
            <DatePickerView view='month'>
              <DatePickerHeader />
              <DatePickerMonthTable />
            </DatePickerView>
            <DatePickerView view='year'>
              <DatePickerHeader />
              <DatePickerYearTable />
            </DatePickerView>
          </DatePickerContent>
        </DatePickerPositioner>
      </Portal>
    </DatePickerRoot>
  )
}

export default DatePicker

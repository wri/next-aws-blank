'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Box, Separator } from '@chakra-ui/react'

import {
  Table,
  TableRow,
  TableCell,
  Checkbox,
  Search,
  TabBar,
  Button,
  Tag,
  Breadcrumb,
  MultiActionButton,
  getThemedColor,
} from '@worldresources/wri-design-systems'
import {
  PlaceholderIcon,
  ShareIcon,
  MenuDotsIcon,
  CheckIcon,
  FilterIcon,
  UserIcon,
  AiIcon,
  ColumnsIcon,
  SideBarIcon,
} from '../../components/icons'

const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
  },
  {
    key: 'age',
    label: 'Age',
    sortable: true,
  },
]

type RowData = {
  id: string | number
  name: string
  email: string
  age: number
}

const data: Record<string, string | number>[] = Array(100)
  .fill(0)
  .map((_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
    email: `email${i + 1}@example.com`,
    age: i,
  }))

const TabularInterfaces = () => {
  const totalItems = 100
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedRows, setSelectedRows] = useState<RowData[]>([])
  const [filterText, setFilterText] = useState('')

  const [sortColumn, setSortColumn] = useState<{ key: string; order: string }>({
    key: '',
    order: '',
  })

  const startRange = (currentPage - 1) * pageSize
  const endRange = startRange + pageSize

  let fullData = [
    ...data.filter(
      (item) =>
        item.name.toString().toLowerCase().includes(filterText.toLowerCase()) ||
        item.email.toString().toLowerCase().includes(filterText.toLowerCase()),
    ),
  ]

  if (sortColumn && sortColumn.key !== '') {
    const { key, order } = sortColumn
    const isDesc = order === 'desc'

    fullData = fullData.sort((a, b) => {
      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        const newA = a[key]
        const newB = b[key]

        return isDesc ? newA.localeCompare(newB) : newB.localeCompare(newA)
      }

      const newA = a[key] as number
      const newB = b[key] as number

      return isDesc ? newA - newB : newB - newA
    })
  }

  const dataByPage = fullData.slice(startRange, endRange) as RowData[]

  const selectableRenderRow = (rowData: RowData) => {
    const handleOnRowSelected = ({
      checked,
    }: {
      checked: boolean | string
    }) => {
      const isChecked = checked === true || checked === 'true'
      setSelectedRows((current = [] as RowData[]) => {
        if (isChecked) {
          return [...current, rowData]
        }

        return current.filter((item) => item.id !== rowData.id)
      })
    }

    return (
      <TableRow
        aria-selected={selectedRows?.some((item) => item.id === rowData.id)}
      >
        <TableCell>
          <Checkbox
            name={`checkbox-${rowData.id}`}
            onCheckedChange={handleOnRowSelected}
            checked={selectedRows?.some((item) => item.id === rowData.id)}
          />
        </TableCell>
        <TableCell>{rowData.name}</TableCell>
        <TableCell>{rowData.email}</TableCell>
        <TableCell>{rowData.age}</TableCell>
      </TableRow>
    )
  }

  const onAllItemsSelected = (checked: boolean) => {
    if (checked) {
      setSelectedRows(dataByPage)
    } else {
      setSelectedRows([])
    }
  }

  const searchOptions = data.map((col) => ({
    id: col.id.toString(),
    label: col.name.toString(),
    value: col.name.toString(),
  }))

  return (
    <div
      style={{
        backgroundColor: getThemedColor('primary', 100),
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          backgroundColor: getThemedColor('neutral', 100),
          borderBottom: `1px solid ${getThemedColor('neutral', 300)}`,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px',
        }}
      >
        <Breadcrumb
          links={[
            {
              label: 'Page Level 1',
              link: '#',
              icon: <SideBarIcon />,
            },
            {
              label: 'Page Level 2',
              link: '#',
            },
            {
              label: '...',
              link: '#',
            },
            {
              label: 'Page Level 3',
              link: '#',
            },
          ]}
          linkRouter={Link}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant='secondary'
            size='small'
            label='Ask AI'
            leftIcon={<AiIcon />}
            onClick={() => console.log('Clicked')}
          />
          <Button
            variant='secondary'
            size='small'
            label='Manage Access (10)'
            leftIcon={<UserIcon />}
            onClick={() => console.log('Clicked')}
          />
          <Button
            variant='secondary'
            size='small'
            label='Share'
            leftIcon={<ShareIcon />}
            onClick={() => console.log('Clicked')}
          />
          <Button
            variant='borderless'
            size='small'
            label=''
            leftIcon={<MenuDotsIcon />}
            onClick={() => console.log('Clicked')}
          />
        </div>
      </div>
      <div
        style={{
          backgroundColor: getThemedColor('neutral', 100),
          borderBottom: `1px solid ${getThemedColor('neutral', 300)}`,
        }}
      >
        <TabBar
          variant='transparent'
          tabs={[
            { label: 'Label 1', value: 'one', icon: <PlaceholderIcon /> },
            { label: 'Label 2', value: 'two', icon: <PlaceholderIcon /> },
            { label: 'Label 3', value: 'three', icon: <PlaceholderIcon /> },
            { label: 'Label 4', value: 'four', icon: <PlaceholderIcon /> },
            { label: 'Label 5', value: 'five', icon: <PlaceholderIcon /> },
            { label: 'Label 6', value: 'six', icon: <PlaceholderIcon /> },
            { label: 'Label 7', value: 'seven', icon: <PlaceholderIcon /> },
          ]}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '20rem' }}>
            <Search
              size='small'
              options={searchOptions}
              placeholder='Search'
              displayResults='none'
              onQueryChange={setFilterText}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
            <Button
              variant='secondary'
              size='small'
              label='Filter (2)'
              leftIcon={<FilterIcon />}
              onClick={() => console.log('Clicked')}
            />
            <Tag label='Label' variant='success' icon={<CheckIcon />} />
            <Tag label='Label' variant='info-white' />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant='secondary'
            size='small'
            label='Group: Label'
            onClick={() => console.log('Clicked')}
          />
          <Button
            variant='secondary'
            size='small'
            label='Sort: Label'
            onClick={() => console.log('Clicked')}
          />
          <Separator orientation='vertical' height='24px' />
          <Button
            variant='secondary'
            size='small'
            label='Columns'
            leftIcon={<ColumnsIcon />}
            onClick={() => console.log('Clicked')}
          />
          <Separator orientation='vertical' height='24px' />
          <div>
            <MultiActionButton
              variant='secondary'
              size='small'
              mainActionLabel='Export'
              mainActionOnClick={() => console.log('first action')}
              otherActions={[
                {
                  label: 'Second Action',
                  value: 'second-action',
                  onClick: () => console.log('second action'),
                },
              ]}
            />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', padding: '0px 16px' }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            width='25%'
            style={{
              border: `1px solid ${getThemedColor('neutral', 300)}`,
              background: getThemedColor('neutral', 100),
              borderRadius: '4px',
              paddingBottom: '4px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    color: getThemedColor('neutral', 700),
                  }}
                >
                  Stat title
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: getThemedColor('neutral', 800),
                  }}
                >
                  Stat
                </p>
              </div>
              <div>
                <PlaceholderIcon />
              </div>
            </div>
          </Box>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '50px',
          padding: '16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '900px' }}>
          <Table
            columns={columns}
            data={dataByPage}
            renderRow={selectableRenderRow}
            onSortColumn={setSortColumn}
            onPageSizeChange={setPageSize}
            onPageChange={setCurrentPage}
            pagination={{
              totalItems,
              currentPage,
              pageSize,
              showItemCount: true,
            }}
            onAllItemsSelected={onAllItemsSelected}
            selectedRows={selectedRows}
            selectable
          />
        </div>
      </div>
    </div>
  )
}

export default TabularInterfaces

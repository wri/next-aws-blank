'use client'

import { useState, useMemo } from 'react'
import { Combobox, Portal, createListCollection } from '@chakra-ui/react'
import { Tag, getThemedColor } from '@worldresources/wri-design-systems'
import { PlainContributor } from '@/types/answer.types'
import { useTranslations } from '@/i18n/useTranslations'

interface ContributorsComboboxProps {
  selectedContributorIds: string[]
  allContributors: PlainContributor[]
  onContributorsChange: (contributorIds: string[]) => void
  onContributorCreate: (name: string) => Promise<PlainContributor>
  disabled?: boolean
}

export function Responsibility({
  selectedContributorIds,
  allContributors,
  onContributorsChange,
  onContributorCreate,
  disabled = false,
}: ContributorsComboboxProps) {
  const t = useTranslations()
  const [inputValue, setInputValue] = useState('')

  const selectedContributors = allContributors.filter((c) =>
    selectedContributorIds.includes(c.id),
  )

  // Filter available contributors by input (exclude already selected)
  const filteredContributors = useMemo(() => {
    return allContributors.filter(
      (c) =>
        c.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedContributorIds.includes(c.id),
    )
  }, [allContributors, inputValue, selectedContributorIds])

  // Check if input matches any existing contributor exactly
  const exactMatch = useMemo(() => {
    return allContributors.find(
      (c) => c.name.toLowerCase() === inputValue.trim().toLowerCase(),
    )
  }, [allContributors, inputValue])

  const showCreateOption = inputValue.trim() !== '' && !exactMatch

  // Build collection items for Combobox
  const collectionItems = useMemo(() => {
    const items = filteredContributors.map((c) => ({
      label: c.name,
      value: c.id,
    }))

    // Add create option as synthetic item at the beginning
    if (showCreateOption) {
      items.unshift({
        label: `+ Create "${inputValue.trim()}"`,
        value: 'CREATE_NEW',
      })
    }

    return items
  }, [filteredContributors, showCreateOption, inputValue])

  const collection = useMemo(
    () => createListCollection({ items: collectionItems }),
    [collectionItems],
  )

  const handleDeselect = (contributorId: string) => {
    onContributorsChange(
      selectedContributorIds.filter((id) => id !== contributorId),
    )
  }

  const handleCreate = async () => {
    if (!inputValue.trim()) return

    const name = inputValue.trim()

    try {
      const contributor = await onContributorCreate(name)
      onContributorsChange([...selectedContributorIds, contributor.id])
      setInputValue('')
    } catch (error) {
      console.error('Failed to create contributor:', error)
    }

    return name
  }

  const handleValueChange = async (details: { value: string[] }) => {
    // Check if CREATE_NEW was selected
    if (details.value.includes('CREATE_NEW')) {
      return await handleCreate() // Fire async, creates and auto-selects in parent
    }

    onContributorsChange(details.value)
  }

  const handleInputValueChange = (details: { inputValue: string }) => {
    setInputValue(details.inputValue)
  }

  return (
    <div>
      <p className='text-neutral-900 mb-1.5'>
        {t('assessment.strategies.fields.responsibility.label')}{' '}
        <span className='text-neutral-700'>{t('common.optional')}</span>
      </p>

      <Combobox.Root
        multiple
        closeOnSelect
        openOnClick
        inputValue={inputValue}
        value={selectedContributorIds}
        collection={collection}
        onValueChange={handleValueChange}
        onInputValueChange={handleInputValueChange}
        disabled={disabled}
      >
        <Combobox.Control>
          <Combobox.Input
            placeholder={t('assessment.strategies.fields.responsibility.placeholder')}
            css={{
              backgroundColor: 'white',
              borderColor: 'neutral.700',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '14px',
              '&:focus': {
                borderColor: 'primary.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
              },
              '&:disabled': {
                backgroundColor: 'neutral.100',
                cursor: 'not-allowed',
              },
            }}
          />
          <Combobox.Trigger />
        </Combobox.Control>

        <Portal>
          <Combobox.Positioner
            css={{
              top: '-22px !important',
            }}
          >
            <Combobox.Content
              css={{
                maxHeight: '240px',
                overflowY: 'auto',
                backgroundColor: 'white',
                border: '1px solid',
                borderColor: 'neutral.300',
                borderRadius: '4px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                zIndex: 50,
              }}
            >
              <Combobox.ItemGroup>
                {collectionItems.map((item) => {
                  const isCreateItem = item.value === 'CREATE_NEW'
                  return (
                    <Combobox.Item
                      key={item.value}
                      item={item}
                      css={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: isCreateItem
                          ? getThemedColor('neutral', 600)
                          : 'slate.900',
                        fontWeight: isCreateItem ? '500' : '400',
                        borderBottom: isCreateItem ? '1px solid' : 'none',
                        borderColor: isCreateItem ? 'slate.200' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'slate.50',
                        },
                        '&[data-highlighted]': {
                          backgroundColor: 'slate.50',
                        },
                      }}
                    >
                      {item.label}
                      {!isCreateItem && <Combobox.ItemIndicator />}
                    </Combobox.Item>
                  )
                })}
              </Combobox.ItemGroup>
              {inputValue.trim() !== '' && (
                <Combobox.Empty
                  css={{
                    padding: '8px 12px',
                    fontSize: '14px',
                    color: 'slate.500',
                  }}
                >
                  {t('assessment.contributors.empty')}
                </Combobox.Empty>
              )}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>

      {/* Selected contributors as tags - Column layout */}
      {selectedContributors.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {selectedContributors
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((contributor) => (
              <Tag
                closable
                key={contributor.id}
                label={contributor.name}
                variant='info-white'
                size='default'
                onClose={() => handleDeselect(contributor.id)}
              />
            ))}
        </div>
      )}
    </div>
  )
}

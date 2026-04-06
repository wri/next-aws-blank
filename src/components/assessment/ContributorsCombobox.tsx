'use client'

import { useState, useMemo } from 'react'
import { Combobox, Portal, createListCollection, Box } from '@chakra-ui/react'
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

export function ContributorsCombobox({
  selectedContributorIds,
  allContributors,
  onContributorsChange,
  onContributorCreate,
  disabled = false,
}: ContributorsComboboxProps) {
  const t = useTranslations()
  const [inputValue, setInputValue] = useState('')
  
  const selectedContributors = allContributors.filter(c => 
    selectedContributorIds.includes(c.id)
  )
  
  // Filter available contributors by input (exclude already selected)
  const filteredContributors = useMemo(() => {
    return allContributors.filter(c =>
      c.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedContributorIds.includes(c.id)
    )
  }, [allContributors, inputValue, selectedContributorIds])
  
  // Check if input matches any existing contributor exactly
  const exactMatch = useMemo(() => {
    return allContributors.find(c => 
      c.name.toLowerCase() === inputValue.trim().toLowerCase()
    )
  }, [allContributors, inputValue])
  
  const showCreateOption = inputValue.trim() !== '' && !exactMatch
  
  // Build collection items for Combobox
  const collectionItems = useMemo(() => {
    const items = filteredContributors.map(c => ({
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
    [collectionItems]
  )
  
  const handleDeselect = (contributorId: string) => {
    onContributorsChange(
      selectedContributorIds.filter(id => id !== contributorId)
    )
  }
  
  const handleCreate = async () => {
    if (!inputValue.trim()) return
    
    try {
      await onContributorCreate(inputValue.trim())
      // Contributor is already added optimistically, just clear input
      setInputValue('')
    } catch (error) {
      console.error('Failed to create contributor:', error)
      // Error already tracked in parent component
    }
  }
  
  const handleValueChange = (details: { value: string[] }) => {
    // Check if CREATE_NEW was selected
    if (details.value.includes('CREATE_NEW')) {
      handleCreate() // Fire async, creates and auto-selects in parent
      // Don't call onContributorsChange - the create handler already updates selection
      return
    }
    
    // Normal selection - parent now handles answer creation if needed
    onContributorsChange(details.value)
  }
  
  const handleInputValueChange = (details: { inputValue: string }) => {
    setInputValue(details.inputValue)
  }
  
  return (
    <div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {t('assessment.contributors.heading')}
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          {t('assessment.contributors.description')}
        </p>
      </div>
      
      <Combobox.Root
        multiple
        closeOnSelect={true}
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
            placeholder={t('assessment.contributors.field.placeholder')}
            css={{
              backgroundColor: 'white',
              borderColor: 'neutral.300',
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
              }
            }}
          />
        </Combobox.Control>
        
        <Portal>
          <Combobox.Positioner>
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
              {inputValue.trim() !== '' && filteredContributors.length === 0 && (
                <Box
                  role='option'
                  aria-disabled='true'
                  aria-selected='false'
                  css={{ padding: '8px 12px', fontSize: '14px', color: 'neutral.500' }}
                >
                  {t('assessment.contributors.noMatches')}
                </Box>
              )}
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
                        color: isCreateItem ? getThemedColor('neutral', 600) : 'slate.900',
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
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
      
      {/* Selected contributors as tags - Column layout */}
      {selectedContributors.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginTop: '12px',
            alignItems: 'flex-start',
          }}
        >
          {selectedContributors.map((contributor) => (
            <Tag
              closable
              key={contributor.id}
              label={contributor.name}
              variant="info-white"
              size="default"
              onClose={() => handleDeselect(contributor.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

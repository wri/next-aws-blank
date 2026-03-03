'use client'

import SectionTitle from './SectionTitle'
import CardContainer from './CardContainer'
import { IconButton, Tag } from '@worldresources/wri-design-systems'
import { CheckCircleIcon, CopyIcon } from '../../icons'
import { useState } from 'react'
import { copyTextToClipboard } from '@/utils/validation'
import { TARGET_GEOGRAPHY_TYPE_OPTIONS } from '@/constants'

const Title = ({ title }: { title: string }) => {
  return (
    <div className='flex items-center justify-between gap-3 mt-3 mb-2'>
      <p className='text-lg font-bold text-neutral-800'>{title}</p>
      <hr className='w-full border-neutral-300 h-[1px] flex-1' />
    </div>
  )
}

interface ScopeProps {
  data: {
    title: string
    diagnosticLead: {
      name: string
      email: string
      organization: string | null
      role: string | null
    }
    diagnosticScope: {
      geography: {
        country: string | null
        geographyType: string
        subRegion: string | null
        gisUrl: string | null
      }
      timeHorizon: {
        completionYear: string
      }
      restorationGoals: {
        goals: string
        ecosystems: string[]
      }
    }
  }
}

const Scope = ({ data }: ScopeProps) => {
  const [isEmailCopied, setIsEmailCopied] = useState(false)
  const [isLinkCopied, setIsLinkCopied] = useState(false)

  const handleCopyEmail = async (text: string | undefined) => {
    if (!text) return

    await copyTextToClipboard(text)

    setIsEmailCopied(true)
    setTimeout(() => setIsEmailCopied(false), 2000)
  }

  const handleCopyLink = async (text: string | null | undefined) => {
    if (!text) return

    await copyTextToClipboard(text)

    setIsLinkCopied(true)
    setTimeout(() => setIsLinkCopied(false), 2000)
  }

  return (
    <div>
      <SectionTitle index={1} title='Scope' />
      <CardContainer title='About the diagnostic' hideLabel='section'>
        <Title title='Title' />
        <p className='text-neutral-700 mb-8'>{data.title}</p>

        <Title title='Diagnostic lead' />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4'>
          <div>
            <p className='text-neutral-700 text-sm'>Full name</p>
            <p className='text-neutral-800 font-bold'>
              {data.diagnosticLead.name}
            </p>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Email</p>
            <div className='flex items-center gap-2'>
              <p className='text-neutral-800 font-bold underline decoration-primary-700 decoration-dotted'>
                {data.diagnosticLead.email}
              </p>
              <IconButton
                icon={<CopyIcon />}
                onClick={() => handleCopyEmail(data.diagnosticLead.email)}
              />
              {isEmailCopied && (
                <div className='flex items-center gap-2'>
                  <p className='text-sm'>Copied</p>
                  <CheckCircleIcon className='text-success-500 h-5 w-5' />
                </div>
              )}
            </div>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Organization</p>
            <p className='text-neutral-800 font-bold'>
              {data.diagnosticLead.organization || 'No information provided'}
            </p>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Job role</p>
            <p className='text-neutral-800 font-bold'>
              {data.diagnosticLead.role || 'No information provided'}
            </p>
          </div>
        </div>
      </CardContainer>

      <CardContainer
        title='Diagnostic scope'
        onEdit={() => {}}
        hideLabel='section'
      >
        <Title title='Geography' />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>Country</p>
            <p className='text-neutral-800 font-bold'>
              {data.diagnosticScope.geography.country}
            </p>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Target scale</p>
            <p className='text-neutral-800 font-bold'>
              {data.diagnosticScope.geography.geographyType
                ? TARGET_GEOGRAPHY_TYPE_OPTIONS[
                    data.diagnosticScope.geography.geographyType
                  ]
                : 'No information provided'}
            </p>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Sub-region / Province</p>
            <p className='text-neutral-800 font-bold'>
              {data.diagnosticScope.geography.subRegion}
            </p>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>
              Restoration boundary link
            </p>
            {data.diagnosticScope.geography.gisUrl ? (
              <div className='flex items-center gap-2'>
                <p className='text-neutral-800 font-bold underline decoration-primary-700 decoration-dotted'>
                  {data.diagnosticScope.geography.gisUrl}
                </p>
                <IconButton
                  icon={<CopyIcon />}
                  onClick={() =>
                    handleCopyLink(data.diagnosticScope.geography.gisUrl)
                  }
                />
                {isLinkCopied && (
                  <div className='flex items-center gap-2'>
                    <p className='text-sm'>Copied</p>
                    <CheckCircleIcon className='text-success-500 h-5 w-5' />
                  </div>
                )}
              </div>
            ) : (
              <p className='text-neutral-800 font-bold'>
                No information provided
              </p>
            )}
          </div>
        </div>

        <Title title='Time horizon' />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>Completion year</p>
            <p className='text-neutral-800 font-bold'>
              {data.diagnosticScope.timeHorizon.completionYear}
            </p>
          </div>
        </div>

        <Title title='Restoration goals' />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>Goals</p>
            <div className='flex flex-wrap gap-2'>
              <div
                className='[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-neutral-800 [&_h1]:mb-1 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-neutral-800 [&_h2]:mb-1 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-neutral-800 [&_h3]:mb-1 [&_p]:text-neutral-800 [&_p]:mb-2'
                dangerouslySetInnerHTML={{
                  __html: data.diagnosticScope.restorationGoals.goals,
                }}
              />
            </div>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Ecosystems</p>
            <div className='flex flex-wrap gap-2'>
              {data.diagnosticScope.restorationGoals.ecosystems.map((item) => (
                <Tag
                  key={item}
                  label={item.charAt(0).toUpperCase() + item.slice(1)}
                  variant='info-white'
                />
              ))}
            </div>
          </div>
        </div>
      </CardContainer>
    </div>
  )
}

export default Scope

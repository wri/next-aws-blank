'use client'

import SectionTitle from './SectionTitle'
import CardContainer from './CardContainer'
import { IconButton, Tag } from '@worldresources/wri-design-systems'
import { CheckCircleIcon, CopyIcon } from '../../icons'
import { useState } from 'react'
import { copyTextToClipboard, hasRichTextContent } from '@/utils/validation'
import { PREPARATION_STEPS, TARGET_GEOGRAPHY_TYPE_OPTIONS } from '@/constants'
import RichText from '@/components/ui/RichText'
import { useRouter } from 'next/navigation'

const NoInformation = () => {
  return <div className='h-[3px] w-6 bg-neutral-400 mt-[14.5px]' />
}

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
      gender: string | null
      ageRange: string | null
      identity: string | null
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
      diagnosticPlanning: {
        engagementStrategy: string
        materials: string
      }
    }
  }
  assessmentId: string
}

const Scope = ({ data, assessmentId }: ScopeProps) => {
  const [isEmailCopied, setIsEmailCopied] = useState(false)
  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const [isMaterialsLinkCopied, setIsMaterialsLinkCopied] = useState(false)
  const router = useRouter()

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

  const handleCopyMaterialsLink = async (text: string | null | undefined) => {
    if (!text) return

    await copyTextToClipboard(text)

    setIsMaterialsLinkCopied(true)
    setTimeout(() => setIsMaterialsLinkCopied(false), 2000)
  }

  return (
    <div>
      <SectionTitle index={1} title='Scope' />
      <CardContainer title='About this diagnostic' hideLabel='section'>
        <Title title='Title' />
        <p className='text-neutral-700 mb-8'>{data.title}</p>

        <Title title='Diagnostic lead' />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4'>
          <div>
            <p className='text-neutral-700 text-sm'>Name</p>
            <p className='text-neutral-800 font-bold mt-1'>
              {data.diagnosticLead.name}
            </p>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Email</p>
            <div className='flex items-center gap-2 mt-1'>
              <p className='text-neutral-800 font-bold underline decoration-primary-700 decoration-dotted'>
                {data.diagnosticLead.email}
              </p>
              {isEmailCopied ? (
                <CheckCircleIcon className='text-success-500 h-5 w-5' />
              ) : (
                <IconButton
                  icon={<CopyIcon />}
                  onClick={() => handleCopyEmail(data.diagnosticLead.email)}
                />
              )}
            </div>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Organization</p>
            {data.diagnosticLead.organization ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticLead.organization}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Job role</p>
            {data.diagnosticLead.role ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticLead.role}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Gender</p>
            {data.diagnosticLead.gender ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticLead.gender}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Age range</p>
            {data.diagnosticLead.ageRange ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticLead.ageRange}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>
              Indigenous People & Local Community identification
            </p>
            {data.diagnosticLead.identity ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticLead.identity}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
        </div>
      </CardContainer>

      <CardContainer
        title='Diagnostic scope & planning'
        onEdit={() =>
          router.push(
            `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.TARGET_GEOGRAPHY}?isEditMode=true`,
          )
        }
        hideLabel='section'
      >
        <Title title='Geography' />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>Target scale</p>
            <p className='text-neutral-800 font-bold mt-1'>
              {data.diagnosticScope.geography.geographyType
                ? TARGET_GEOGRAPHY_TYPE_OPTIONS[
                    data.diagnosticScope.geography.geographyType
                  ]
                : 'No information provided'}
            </p>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Country</p>
            {data.diagnosticScope.geography.country ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticScope.geography.country}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Sub-region / Province</p>
            {data.diagnosticScope.geography.subRegion ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticScope.geography.subRegion}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>
              Restoration boundary link
            </p>
            {data.diagnosticScope.geography.gisUrl ? (
              <div className='flex items-center gap-2 mt-1'>
                <p className='text-neutral-800 font-bold underline decoration-primary-700 decoration-dotted'>
                  {data.diagnosticScope.geography.gisUrl}
                </p>
                {isLinkCopied ? (
                  <CheckCircleIcon className='text-success-500 h-5 w-5' />
                ) : (
                  <IconButton
                    icon={<CopyIcon />}
                    onClick={() =>
                      handleCopyLink(data.diagnosticScope.geography.gisUrl)
                    }
                  />
                )}
              </div>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Ecosystem types</p>
            <div className='flex flex-wrap gap-2 mt-1'>
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

        <Title title='Time horizon' />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>Completion year</p>
            {data.diagnosticScope.timeHorizon.completionYear ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticScope.timeHorizon.completionYear}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
        </div>

        <Title title='Restoration goals' />
        <div className='grid grid-col-1 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>Goals</p>
            {hasRichTextContent(data.diagnosticScope.restorationGoals.goals) ? (
              <div className='flex flex-wrap gap-2 mt-1'>
                <RichText html={data.diagnosticScope.restorationGoals.goals} />
              </div>
            ) : (
              <NoInformation />
            )}
          </div>
        </div>

        <Title title='Diagnostic planning' />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>Engagement strategy</p>
            {hasRichTextContent(
              data.diagnosticScope.diagnosticPlanning.engagementStrategy,
            ) ? (
              <div className='flex flex-wrap gap-2 mt-1'>
                <RichText
                  html={
                    data.diagnosticScope.diagnosticPlanning.engagementStrategy
                  }
                />
              </div>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>Shared folder link</p>
            {data.diagnosticScope.diagnosticPlanning.materials ? (
              <div className='flex items-center gap-2 mt-1'>
                <p className='text-neutral-800 font-bold underline decoration-primary-700 decoration-dotted'>
                  {data.diagnosticScope.diagnosticPlanning.materials}
                </p>
                {isMaterialsLinkCopied ? (
                  <CheckCircleIcon className='text-success-500 h-5 w-5' />
                ) : (
                  <IconButton
                    icon={<CopyIcon />}
                    onClick={() =>
                      handleCopyMaterialsLink(
                        data.diagnosticScope.diagnosticPlanning.materials,
                      )
                    }
                  />
                )}
              </div>
            ) : (
              <NoInformation />
            )}
          </div>
        </div>
      </CardContainer>
    </div>
  )
}

export default Scope

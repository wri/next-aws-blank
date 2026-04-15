'use client'

import SectionTitle from './SectionTitle'
import CardContainer from './CardContainer'
import { IconButton, Tag } from '@worldresources/wri-design-systems'
import { CheckCircleIcon, CopyIcon } from '../../icons'
import { useState } from 'react'
import { copyTextToClipboard, hasRichTextContent } from '@/utils/validation'
import { PREPARATION_STEPS } from '@/constants'
import RichText from '@/components/ui/RichText'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/i18n/useTranslations'

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
  const t = useTranslations()
  const genderLabelMap: Record<string, string> = {
    woman: t('forms.setup.genderOptions.woman'),
    man: t('forms.setup.genderOptions.man'),
    non_binary: t('forms.setup.genderOptions.nonBinary'),
    intersex: t('forms.setup.genderOptions.intersex'),
    prefer_not_to_say: t('forms.setup.genderOptions.preferNotToSay'),
    identity_not_listed: t('forms.setup.genderOptions.identityNotListed'),
  }
  const ageRangeLabelMap: Record<string, string> = {
    under_25: t('forms.setup.ageRangeOptions.under25'),
    '25_34': t('forms.setup.ageRangeOptions.25to34'),
    '35_44': t('forms.setup.ageRangeOptions.35to44'),
    '45_54': t('forms.setup.ageRangeOptions.45to54'),
    '55_64': t('forms.setup.ageRangeOptions.55to64'),
    '65_plus': t('forms.setup.ageRangeOptions.65plus'),
    prefer_not_to_say: t('forms.setup.ageRangeOptions.preferNotToSay'),
  }
  const identityLabelMap: Record<string, string> = {
    indigenous_peoples: t('forms.setup.identityOptions.indigenousPeoples'),
    local_communities: t('forms.setup.identityOptions.localCommunities'),
    ethnic_minority: t('forms.setup.identityOptions.ethnicMinority'),
    other: t('forms.setup.identityOptions.other'),
    prefer_not_to_say: t('forms.setup.identityOptions.preferNotToSay'),
    none: t('forms.setup.identityOptions.none'),
  }
  const allEcosystemLabelMap: Record<string, string> = {
    'tropical-subtropical-forests': t(
      'scoping.ecosystems.terrestrial.types.tropicalSubtropicalForests',
    ),
    'temperate-boreal-forests-and-woodlands': t(
      'scoping.ecosystems.terrestrial.types.temperateForests',
    ),
    'shrublands-and-shrubby-woodlands': t(
      'scoping.ecosystems.terrestrial.types.shrublands',
    ),
    'savannas-and-grasslands': t(
      'scoping.ecosystems.terrestrial.types.savannas',
    ),
    'deserts-and-semi-deserts': t(
      'scoping.ecosystems.terrestrial.types.deserts',
    ),
    'polar-alpine': t('scoping.ecosystems.terrestrial.types.polarAlpine'),
    'productive-and-agricultural-systems': t(
      'scoping.ecosystems.terrestrial.types.agricultural',
    ),
    'urban-landscapes': t('scoping.ecosystems.terrestrial.types.urban'),
    peatlands: t('scoping.ecosystems.freshwater.types.peatlands'),
    wetlands: t('scoping.ecosystems.freshwater.types.wetlands'),
    'riparian-ecosystems': t('scoping.ecosystems.freshwater.types.riparian'),
    catchments: t('scoping.ecosystems.freshwater.types.catchments'),
    'artificial-fresh-waters': t(
      'scoping.ecosystems.freshwater.types.artificialFreshwaters',
    ),
    'marine-shelfs': t('scoping.ecosystems.marine.types.marineShelfs'),
    'mangroves-and-shoreline-systems': t(
      'scoping.ecosystems.marine.types.mangroves',
    ),
    'deep-sea-floors': t('scoping.ecosystems.marine.types.deepSeaFloors'),
  }

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
      <SectionTitle index={1} title={t('overview.scope.sectionTitle')} />
      <CardContainer
        title={t('overview.scope.aboutDiagnostic.title')}
        hideLabel={t('overview.scope.labels.section')}
      >
        <Title title={t('overview.scope.aboutDiagnostic.sections.title')} />
        <p className='text-neutral-700 mb-8'>{data.title}</p>

        <Title
          title={t('overview.scope.aboutDiagnostic.sections.diagnosticLead')}
        />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4'>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.aboutDiagnostic.fields.name')}
            </p>
            <p className='text-neutral-800 font-bold mt-1'>
              {data.diagnosticLead.name}
            </p>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.aboutDiagnostic.fields.email')}
            </p>
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
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.aboutDiagnostic.fields.organization')}
            </p>
            {data.diagnosticLead.organization ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticLead.organization}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.aboutDiagnostic.fields.jobRole')}
            </p>
            {data.diagnosticLead.role ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticLead.role}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.aboutDiagnostic.fields.gender')}
            </p>
            {data.diagnosticLead.gender ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {genderLabelMap[data.diagnosticLead.gender]}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.aboutDiagnostic.fields.ageRange')}
            </p>
            {data.diagnosticLead.ageRange ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {ageRangeLabelMap[data.diagnosticLead.ageRange]}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.aboutDiagnostic.fields.identity')}
            </p>
            {data.diagnosticLead.identity ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {identityLabelMap[data.diagnosticLead.identity]}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
        </div>
      </CardContainer>

      <CardContainer
        title={t('overview.scope.diagnosticScope.title')}
        onEdit={() =>
          router.push(
            `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.TARGET_GEOGRAPHY}?isEditMode=true`,
          )
        }
        hideLabel={t('overview.scope.labels.section')}
      >
        <Title title={t('overview.scope.diagnosticScope.sections.geography')} />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.diagnosticScope.fields.targetScale')}
            </p>
            <p className='text-neutral-800 font-bold mt-1'>
              {data.diagnosticScope.geography.geographyType
                ? t(
                    `scoping.step1.fields.targetScale.options.${data.diagnosticScope.geography.geographyType}`,
                  )
                : t('overview.scope.empty.noInformation')}
            </p>
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.diagnosticScope.fields.country')}
            </p>
            {data.diagnosticScope.geography.country ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticScope.geography.country}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.diagnosticScope.fields.subRegion')}
            </p>
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
              {t(
                'overview.scope.diagnosticScope.fields.restorationBoundaryLink',
              )}
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
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.diagnosticScope.fields.ecosystemTypes')}
            </p>
            <div className='flex flex-wrap gap-2 mt-1'>
              {data.diagnosticScope.restorationGoals.ecosystems.map((item) => (
                <Tag
                  key={item}
                  label={
                    allEcosystemLabelMap[item] ??
                    item.charAt(0).toUpperCase() + item.slice(1)
                  }
                  variant='info-white'
                />
              ))}
            </div>
          </div>
        </div>

        <Title
          title={t('overview.scope.diagnosticScope.sections.timeHorizon')}
        />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.diagnosticScope.fields.completionYear')}
            </p>
            {data.diagnosticScope.timeHorizon.completionYear ? (
              <p className='text-neutral-800 font-bold mt-1'>
                {data.diagnosticScope.timeHorizon.completionYear}
              </p>
            ) : (
              <NoInformation />
            )}
          </div>
        </div>

        <Title
          title={t('overview.scope.diagnosticScope.sections.restorationGoals')}
        />
        <div className='grid grid-col-1 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.diagnosticScope.fields.goals')}
            </p>
            {hasRichTextContent(data.diagnosticScope.restorationGoals.goals) ? (
              <div className='flex flex-wrap gap-2 mt-1'>
                <RichText html={data.diagnosticScope.restorationGoals.goals} />
              </div>
            ) : (
              <NoInformation />
            )}
          </div>
        </div>

        <Title
          title={t(
            'overview.scope.diagnosticScope.sections.diagnosticPlanning',
          )}
        />
        <div className='grid grid-col-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8'>
          <div>
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.diagnosticScope.fields.engagementStrategy')}
            </p>
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
            <p className='text-neutral-700 text-sm'>
              {t('overview.scope.diagnosticScope.fields.sharedFolderLink')}
            </p>
            {data.diagnosticScope.diagnosticPlanning.materials ? (
              <div className='flex items-center gap-2 mt-1'>
                <p
                  className='text-neutral-800 font-bold underline decoration-primary-700 decoration-dotted'
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {data.diagnosticScope.diagnosticPlanning.materials.length >
                  100
                    ? data.diagnosticScope.diagnosticPlanning.materials.slice(
                        0,
                        100,
                      ) + '...'
                    : data.diagnosticScope.diagnosticPlanning.materials}
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

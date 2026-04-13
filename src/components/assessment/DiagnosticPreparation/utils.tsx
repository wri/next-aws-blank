import TargetGeography from './TargetGeography'
import TimeHorizon from './TimeHorizon'
import RestorationGoals from './RestorationGoals'
import DefineEngagement from './DefineEngagement'
import GatherMaterials from './GatherMaterials'
import { PREPARATION_STEPS } from '@/constants'
import type { createTranslator } from '@/i18n/utils'

type TranslationFunction = ReturnType<typeof createTranslator>

export const preparationStepOrder = [
  PREPARATION_STEPS.TARGET_GEOGRAPHY,
  PREPARATION_STEPS.TIME_HORIZON,
  PREPARATION_STEPS.RESTORATION_GOALS,
  PREPARATION_STEPS.DEFINE_ENGAGEMENT,
  PREPARATION_STEPS.GATHER_MATERIALS,
]

export const getPreparationSteps = (t: TranslationFunction) => [
  {
    id: PREPARATION_STEPS.TARGET_GEOGRAPHY,
    title: t('scoping.sidebar.steps.targetGeography'),
    section: 'scope',
    guidance: [
      {
        title: t('scoping.guidance.step1.whySetTargetGeography.title'),
        content: t('scoping.guidance.step1.whySetTargetGeography.content'),
      },
      {
        title: t('scoping.guidance.step1.howToDoIt.title'),
        content: t('scoping.guidance.step1.howToDoIt.content'),
      },
    ],
    component: <TargetGeography />,
  },
  {
    id: PREPARATION_STEPS.TIME_HORIZON,
    title: t('scoping.sidebar.steps.timeHorizon'),
    section: 'scope',
    guidance: [
      {
        title: t('scoping.guidance.step2.whySetTimeHorizon.title'),
        content: t('scoping.guidance.step2.whySetTimeHorizon.content'),
      },
      {
        title: t('scoping.guidance.step2.howToDoIt.title'),
        content: t('scoping.guidance.step2.howToDoIt.content'),
      },
    ],
    component: <TimeHorizon />,
  },
  {
    id: PREPARATION_STEPS.RESTORATION_GOALS,
    title: t('scoping.sidebar.steps.restorationGoals'),
    section: 'scope',
    guidance: [
      {
        title: t('scoping.guidance.step3.whySetRestorationGoals.title'),
        content: t('scoping.guidance.step3.whySetRestorationGoals.content'),
      },
      {
        title: t('scoping.guidance.step3.howToDoIt.title'),
        content: t('scoping.guidance.step3.howToDoIt.content'),
      },
    ],
    component: <RestorationGoals />,
  },
  {
    id: PREPARATION_STEPS.DEFINE_ENGAGEMENT,
    title: t('scoping.sidebar.steps.engagement'),
    section: 'approach',
    guidance: [
      {
        title: t('scoping.guidance.step4.designingEngagement.title'),
        content: t('scoping.guidance.step4.designingEngagement.content'),
      },
      {
        title: t('scoping.guidance.step4.ensuringInclusion.title'),
        content: t('scoping.guidance.step4.ensuringInclusion.content'),
      },
    ],
    component: <DefineEngagement />,
  },
  {
    id: PREPARATION_STEPS.GATHER_MATERIALS,
    title: t('scoping.sidebar.steps.materials'),
    section: 'approach',
    guidance: [
      {
        title: t('scoping.guidance.step5.preparingEvidence.title'),
        content: t('scoping.guidance.step5.preparingEvidence.content'),
      },
      {
        title: t('scoping.guidance.step5.organizingAccess.title'),
        content: t('scoping.guidance.step5.organizingAccess.content'),
      },
    ],
    component: <GatherMaterials />,
  },
]

type EcosystemOption = {
  children: string
  name: string
  value: string
}

export const getTerrestrialEcosystems = (
  t: TranslationFunction,
): EcosystemOption[] => [
  {
    children: t(
      'scoping.ecosystems.terrestrial.types.tropicalSubtropicalForests',
    ),
    name: 'tropical-subtropical-forests',
    value: 'tropical-subtropical-forests',
  },
  {
    children: t('scoping.ecosystems.terrestrial.types.temperateForests'),
    name: 'temperate-boreal-forests-and-woodlands',
    value: 'temperate-boreal-forests-and-woodlands',
  },
  {
    children: t('scoping.ecosystems.terrestrial.types.shrublands'),
    name: 'shrublands-and-shrubby-woodlands',
    value: 'shrublands-and-shrubby-woodlands',
  },
  {
    children: t('scoping.ecosystems.terrestrial.types.savannas'),
    name: 'savannas-and-grasslands',
    value: 'savannas-and-grasslands',
  },
  {
    children: t('scoping.ecosystems.terrestrial.types.deserts'),
    name: 'deserts-and-semi-deserts',
    value: 'deserts-and-semi-deserts',
  },
  {
    children: t('scoping.ecosystems.terrestrial.types.polarAlpine'),
    name: 'polar-alpine',
    value: 'polar-alpine',
  },
  {
    children: t('scoping.ecosystems.terrestrial.types.agricultural'),
    name: 'productive-and-agricultural-systems',
    value: 'productive-and-agricultural-systems',
  },
  {
    children: t('scoping.ecosystems.terrestrial.types.urban'),
    name: 'urban-landscapes',
    value: 'urban-landscapes',
  },
]

export const getFreshwaterEcosystems = (
  t: TranslationFunction,
): EcosystemOption[] => [
  {
    children: t('scoping.ecosystems.freshwater.types.peatlands'),
    name: 'peatlands',
    value: 'peatlands',
  },
  {
    children: t('scoping.ecosystems.freshwater.types.wetlands'),
    name: 'wetlands',
    value: 'wetlands',
  },
  {
    children: t('scoping.ecosystems.freshwater.types.riparian'),
    name: 'riparian-ecosystems',
    value: 'riparian-ecosystems',
  },
  {
    children: t('scoping.ecosystems.freshwater.types.catchments'),
    name: 'catchments',
    value: 'catchments',
  },
  {
    children: t('scoping.ecosystems.freshwater.types.artificialFreshwaters'),
    name: 'artificial-fresh-waters',
    value: 'artificial-fresh-waters',
  },
]

export const getMarineEcosystems = (
  t: TranslationFunction,
): EcosystemOption[] => [
  {
    children: t('scoping.ecosystems.marine.types.marineShelfs'),
    name: 'marine-shelfs',
    value: 'marine-shelfs',
  },
  {
    children: t('scoping.ecosystems.marine.types.mangroves'),
    name: 'mangroves-and-shoreline-systems',
    value: 'mangroves-and-shoreline-systems',
  },
  {
    children: t('scoping.ecosystems.marine.types.deepSeaFloors'),
    name: 'deep-sea-floors',
    value: 'deep-sea-floors',
  },
]

export const getOtherEcosystems = (
  t: TranslationFunction,
): EcosystemOption[] => [
  {
    children: t('scoping.ecosystems.other.types.other'),
    name: 'other',
    value: 'other',
  },
]

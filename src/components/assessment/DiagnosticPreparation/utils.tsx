import TargetGeography from './TargetGeography'
import TimeHorizon from './TimeHorizon'
import RestorationGoals from './RestorationGoals'
import DefineEngagement from './DefineEngagement'
import GatherMaterials from './GatherMaterials'
import { PREPARATION_STEPS } from '@/constants'

export const steps = [
  {
    id: PREPARATION_STEPS.TARGET_GEOGRAPHY,
    title: 'Target geography',
    section: 'scope',
    guidance: [
      {
        title: 'Why set the target geography',
        content:
          'The geographic area determines which ecosystems/landscapes and scales are assessed, which stakeholders are involved and which restoration options are considered.',
      },
      {
        title: 'How to do it',
        content:
          'Group areas with similar ecological and socio-economic conditions. Avoid splitting ecologically similar areas into separate diagnostics, instead separating areas that differ clearly in ecology, land use, or governance.',
      },
    ],
    component: <TargetGeography />,
  },
  {
    id: PREPARATION_STEPS.TIME_HORIZON,
    title: 'Time horizon',
    section: 'scope',
    guidance: [
      {
        title: 'Why set the time horizon',
        content:
          'Restoration outcomes often take several years to fully materialise. A clear time horizon helps set realistic expectations, choose appropriate restoration approaches, and align the diagnostic with relevant policy and planning processes.',
      },
      {
        title: 'How to do it',
        content:
          'Use a long-term vision for restoration, while recognising that implementation may occur in phases. Where possible, align the timeframe with existing national or sub-national plans to support coordination and uptake.',
      },
    ],
    component: <TimeHorizon />,
  },
  {
    id: PREPARATION_STEPS.RESTORATION_GOALS,
    title: 'Restoration goals',
    section: 'scope',
    guidance: [
      {
        title: 'Why set restoration goals',
        content:
          'Clear restoration goals guide which restoration options are assessed, help manage trade-offs, and define what success looks like for the diagnostic.',
      },
      {
        title: 'How to do it',
        content:
          'Agree on goals early with key stakeholders and keep them specific enough to inform decisions by including information about the type of ecosystem to be restored, the target beneficiaries, and any other desired environmental or socioeconomic goals. Where helpful, use the ROAM methodology to support goal-setting and alignment.',
      },
    ],
    component: <RestorationGoals />,
  },
  {
    id: PREPARATION_STEPS.DEFINE_ENGAGEMENT,
    title: 'Define engagement',
    section: 'approach',
    guidance: [
      {
        title: 'Designing stakeholder engagement',
        content:
          'Start by mapping the social landscape around restoration: who the users are, who is affected, and who has influence. Identify stakeholder needs, motivations, and relationships to understand where friction or alignment may occur. Use this insight to design engagement touchpoints—workshops, interviews, feedback loops—that are inclusive, iterative, and responsive to context. Treat stakeholders as co-designers, not just data sources, to improve usability, relevance, and adoption of the tool.',
      },
      {
        title: 'Ensuring inclusion and equity',
        content: `
          <p>
            Some participants may hesitate to share in group settings, and local social/gender dynamics can exclude some groups.
            The coordinating team should adapt engagement methods to ensure diverse perspectives are captured. This can be done by:
          </p>
          <ul>
            <li>holding separate focus groups for women and/or Indigenous communities</li>
            <li>using local languages</li>
            <li>including trusted intermediaries</li>
            <li>providing travel/compensation where needed</li>
            <li>creating safe space agreements</li>
            <li>allowing anonymous written input for sensitive questions</li>
          </ul>
          `,
      },
    ],
    component: <DefineEngagement />,
  },
  {
    id: PREPARATION_STEPS.GATHER_MATERIALS,
    title: 'Gather materials',
    section: 'approach',
    guidance: [
      {
        title: 'Preparing your evidence',
        content: `
          <p>
            The diagnostic asks you to assess whether key enabling conditions are in place. To answer confidently and consistently, you will need to refer to existing documents, data sources, and policy materials.
          </p>
          <p>
            Please note that evidence can be collected throughout the entire process, if necessary.
          </p>
        `,
      },
      {
        title: 'Organizing access to documents',
        content:
          'Add links to a shared folder or individual documents stored online (for example, in a shared drive or document platform). This ensures that everyone involved can quickly access the same information during workshops or distributed completion.',
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

export const terrestrialEcosystems: EcosystemOption[] = [
  {
    children: 'Tropical-subtropical forests',
    name: 'tropical-subtropical-forests',
    value: 'tropical-subtropical-forests',
  },
  {
    children: 'Temperate-boreal forests and woodlands',
    name: 'temperate-boreal-forests-and-woodlands',
    value: 'temperate-boreal-forests-and-woodlands',
  },
  {
    children: 'Shrublands and shrubby woodlands',
    name: 'shrublands-and-shrubby-woodlands',
    value: 'shrublands-and-shrubby-woodlands',
  },
  {
    children: 'Savannas and grasslands',
    name: 'savannas-and-grasslands',
    value: 'savannas-and-grasslands',
  },
  {
    children: 'Deserts and semi-deserts',
    name: 'deserts-and-semi-deserts',
    value: 'deserts-and-semi-deserts',
  },
  {
    children: 'Polar-alpine',
    name: 'polar-alpine',
    value: 'polar-alpine',
  },
  {
    children: 'Productive and agricultural systems',
    name: 'productive-and-agricultural-systems',
    value: 'productive-and-agricultural-systems',
  },
  {
    children: 'Urban Landscapes',
    name: 'urban-landscapes',
    value: 'urban-landscapes',
  },
]

export const freshwaterEcosystems: EcosystemOption[] = [
  {
    children: 'Peatlands',
    name: 'peatlands',
    value: 'peatlands',
  },
  {
    children: 'Wetlands',
    name: 'wetlands',
    value: 'wetlands',
  },
  {
    children: 'Riparian ecosystems',
    name: 'riparian-ecosystems',
    value: 'riparian-ecosystems',
  },
  {
    children: 'Catchments',
    name: 'catchments',
    value: 'catchments',
  },
  {
    children: 'Artificial fresh waters',
    name: 'artificial-fresh-waters',
    value: 'artificial-fresh-waters',
  },
]

export const marineEcosystems: EcosystemOption[] = [
  {
    children: 'Marine shelfs',
    name: 'marine-shelfs',
    value: 'marine-shelfs',
  },
  {
    children: 'Mangroves and shoreline systems',
    name: 'mangroves-and-shoreline-systems',
    value: 'mangroves-and-shoreline-systems',
  },
  {
    children: 'Deep-sea floors',
    name: 'deep-sea-floors',
    value: 'deep-sea-floors',
  },
]

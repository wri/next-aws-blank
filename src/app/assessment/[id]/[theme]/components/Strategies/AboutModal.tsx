import { WarningIcon } from '@/components/icons'
import { InlineMessage, Modal } from '@worldresources/wri-design-systems'
import Link from 'next/link'

const StrategiesAboutModal = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      header={<p className='font-bold text-neutral-800'>About strategies</p>}
      content={
        <div className='text-neutral-800'>
          <div className='mb-3'>
            <p className='font-bold mb-1'>Why set strategies</p>
            <p>
              Adding strategies allows you to plan how you will address key
              factors that are missing or only partly in place, while
              maintaining those already being addressed. The aim is to identify
              practical actions that increase the likelihood of successful
              restoration in the target geography.
            </p>
          </div>
          <div className='mb-3'>
            <p className='font-bold mb-1'>What to include</p>
            <p>
              Strategies may include policy changes, incentives, institutional
              reforms, capacity-building activities, or cross-sector
              interventions (such as agriculture, finance, or land tenure). When
              defining strategies, consider how they align with existing policy
              processes, planning cycles, regulatory reform opportunities, and
              available technical capacity.
            </p>
            <p className='mt-1'>
              Each strategy should clearly describe who will act, what will be
              done, why the action is needed, when it should happen, and how it
              will be implemented and funded.
            </p>
          </div>
          <div className='mb-3'>
            <p className='font-bold mb-1'>Key considerations</p>
            <p>
              A single strategy may address multiple key factors. If so, record
              it under the most relevant factor and note in the other related
              factors that they are addressed by this strategy.
            </p>
            <p className='mt-1'>
              Example strategies for each factor can be found in the key factor
              guidance. These are illustrative and should be adapted to local
              context.
            </p>
          </div>
          <div className='mb-3'>
            <p className='font-bold mb-1'>Prioritizing strategies</p>
            <p>
              Because resources are limited, strategies should be prioritized.
              Consider the urgency of the gap, dependencies between actions (for
              example land tenure before incentives), feasibility, cost, time to
              impact, and the scale of implementation.
            </p>
            <p className='mt-1'>
              The tool may suggest a recommended priority based on your response
              to a key factor (for example, gaps marked “No” may be flagged as
              higher priority). This recommendation is a guide and can be
              adjusted.
            </p>
          </div>
          <InlineMessage
            label='Important note'
            caption={
              <div>
                <p className='mb-2'>
                  Strategies identified through the diagnostic are intended to
                  inform planning and decision-making, not prescribe specific
                  interventions or provide detailed implementation guidance.
                  Results should be validated with relevant stakeholders.
                </p>
                <p>
                  For further guidance, consult the{' '}
                  <Link
                    href='https://www.wri.org/research/restoration-opportunities-assessment-methodology-roam'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline'
                  >
                    Restoration Opportunities Assessment Methodology (ROAM)
                  </Link>
                  .
                </p>
              </div>
            }
            icon={<WarningIcon />}
            variant='warning'
            size='full-width'
          />
        </div>
      }
    />
  )
}

export default StrategiesAboutModal

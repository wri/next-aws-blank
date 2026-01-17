'use client'
import {
  Breadcrumb,
  Button,
  TextInput,
} from '@worldresources/wri-design-systems'
import Image from 'next/image'
import Link from 'next/link'

const repoBase = process.env.NEXT_PUBLIC_BASE_PATH || ''

const ArticlePage = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className='h-full w-full max-w-[560px] mx-auto py-8 sm:py-16 px-6 sm:px-0'>
      <Breadcrumb
        links={[
          {
            label: 'One',
            link: '#',
          },
        ]}
        linkRouter={Link}
        separator='/'
      />
      <div className='mt-6'>
        <h1 className='text-3xl sm:text-4xl font-bold text-primary-800 mb-1 sm:mb-3'>
          Title
        </h1>
        <p className='text-lg text-neutral-700'>Introduction paragraph</p>
      </div>

      <div className='my-4 sm:my-6'>
        <div className='rounded-[4px] border border-neutral-300 mb-3 overflow-hidden'>
          <Image
            src={`${repoBase}/images/article-image-1.jpg`}
            alt='Article image 1'
            height={315}
            width={560}
          />
        </div>
        <p className='text-neutral-800 mb-4'>Caption</p>
      </div>

      <p className='text-lg text-neutral-700'>
        Lorem ipsum dolor sit amet consectetur. Nullam pulvinar turpis aenean
        nunc semper venenatis volutpat urna. Eget eget egestas sem potenti vitae
        placerat. At egestas nibh mattis volutpat orci rhoncus. In lobortis
        risus hendrerit rhoncus turpis leo. Integer nibh in adipiscing ut tempor
        adipiscing ut viverra. Consectetur turpis semper sed consectetur lorem.
        Nunc fringilla porttitor condimentum elementum sodales. Pulvinar posuere
        nullam vitae lacinia. In ut condimentum posuere vehicula. Molestie
        elementum arcu malesuada at feugiat magnis molestie egestas amet. Mauris
        libero magna quisque proin maecenas tellus. Ut ac sagittis morbi id id
        aliquam fermentum lectus. Quis non neque ac ut ac justo sed sed. Commodo
        pellentesque amet et in dignissim sed viverra tempus quis.
      </p>

      <div className='my-4 sm:my-6'>
        <div className='rounded-[4px] border border-neutral-300 mb-3 overflow-hidden'>
          <Image
            src={`${repoBase}/images/article-image-2.jpg`}
            alt='Article image 2'
            height={315}
            width={560}
            layout='fixed-height'
          />
        </div>
        <p className='text-neutral-800 mb-4'>Caption</p>
      </div>

      <p className='text-lg text-neutral-700 mb-6 sm:mb-10'>
        Tempor non turpis nibh vitae praesent dignissim. Non in ultrices nulla
        at pharetra fermentum ut in. Dolor viverra cursus pulvinar elementum
        urna erat. Egestas neque lectus aliquet libero. Tincidunt ut massa arcu
        volutpat mattis mauris. Aliquet porttitor quisque accumsan dictumst enim
        massa. Facilisis a fusce mauris eu velit morbi tortor. Vulputate odio
        pellentesque egestas facilisi. Nisl etiam curabitur viverra ultricies
        faucibus nulla felis facilisis est. Egestas lorem sit non fringilla orci
        quis. Pharetra velit pharetra ut sit. Commodo erat enim luctus commodo.
      </p>

      <div className='p-6 sm:pt-8 sm:px-6 sm:pb-7 rounded-[4px] border border-neutral-400 shadow-sm'>
        <form onSubmit={onSubmit}>
          <div role='banner'>
            <h2 className='text-2xl sm:text-3xl text-neutral-800 font-bold mb-1'>
              Register for newsletter
            </h2>
            <p className='text-neutral-700'>
              Enter a few details to keep up to date with our latest work.
            </p>
            <hr className='mt-6 mb-8' />
          </div>
          <div className=''>
            <TextInput
              label='Full name'
              className='w-full sm:max-w-96'
              required
            />
            <hr className='my-8' />
            <TextInput
              label='Email address'
              type='email'
              className='w-full sm:max-w-96'
              required
            />
          </div>
          <div className='pt-3' role='contentinfo'>
            <Button label='Submit' variant='primary' type='submit' />
          </div>
        </form>
      </div>
    </div>
  )
}

export default ArticlePage

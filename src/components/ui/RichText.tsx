import clsx from 'clsx'

const RichText = ({
  html,
  className,
}: {
  html: string
  className?: string
}) => {
  return (
    <div
      className={clsx(
        '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-neutral-800 [&_h1]:mb-1 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-neutral-800 [&_h2]:mb-1 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-neutral-800 [&_h3]:mb-1 [&_p]:text-neutral-800 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-1 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_s]:line-through [&_strike]:line-through [&_del]:line-through',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default RichText

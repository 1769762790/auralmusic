import type { ArtistDescriptionProps } from '../types'

const ArtistDescription = ({ description }: ArtistDescriptionProps) => {
  const hasContent = Boolean(
    description.summary || description.sections.length > 0
  )

  return (
    <section className='space-y-5'>
      <h2 className='text-foreground text-3xl font-bold tracking-tight'>
        歌手介绍
      </h2>
      <div className='border-border/60 bg-card/68 space-y-6 rounded-[30px] border p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)]'>
        {!hasContent ? (
          <p className='text-muted-foreground text-sm'>暂无歌手介绍</p>
        ) : (
          <>
            {description.summary ? (
              <p className='text-muted-foreground text-base leading-8'>
                {description.summary}
              </p>
            ) : null}
            {description.sections.map(section => (
              <article
                key={section.title || section.content.slice(0, 20)}
                className='space-y-2'
              >
                {section.title ? (
                  <h3 className='text-xl font-semibold'>{section.title}</h3>
                ) : null}
                <p className='text-muted-foreground text-base leading-8 whitespace-pre-wrap'>
                  {section.content}
                </p>
              </article>
            ))}
          </>
        )}
      </div>
    </section>
  )
}

export default ArtistDescription

import {
  memo,
  useEffect,
  useRef,
  useState,
  type ImgHTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils'

type DeferredCachedImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src'
> & {
  src: string
  cacheKey?: string
  rootMargin?: string
  placeholderClassName?: string
}

function DeferredCachedImage({
  src,
  cacheKey,
  alt,
  className,
  rootMargin = '240px 0px',
  placeholderClassName,
  ...props
}: DeferredCachedImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [resolvedSrc, setResolvedSrc] = useState('')

  useEffect(() => {
    setResolvedSrc('')
    setShouldLoad(false)
  }, [cacheKey, src])

  useEffect(() => {
    const element = containerRef.current

    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry?.isIntersecting) {
          return
        }

        setShouldLoad(true)
        observer.disconnect()
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, cacheKey, src])

  useEffect(() => {
    if (!shouldLoad || !src) {
      return
    }

    let cancelled = false

    const loadImage = async () => {
      if (!cacheKey) {
        if (!cancelled) {
          setResolvedSrc(src)
        }
        return
      }

      try {
        const result = await window.electronCache.resolveImageSource(
          cacheKey,
          src
        )

        if (!cancelled) {
          setResolvedSrc(result.url || src)
        }
      } catch {
        if (!cancelled) {
          setResolvedSrc(src)
        }
      }
    }

    void loadImage()

    return () => {
      cancelled = true
    }
  }, [cacheKey, shouldLoad, src])

  return (
    <div ref={containerRef} className='size-full'>
      {resolvedSrc ? (
        <img
          {...props}
          src={resolvedSrc}
          alt={alt}
          className={className}
          loading='lazy'
          decoding='async'
        />
      ) : (
        <div
          aria-hidden='true'
          className={cn(
            'bg-muted/35 size-full',
            className,
            placeholderClassName
          )}
        />
      )}
    </div>
  )
}

export default memo(DeferredCachedImage)

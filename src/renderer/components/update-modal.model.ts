import createDOMPurify from 'dompurify'

const EMPTY_UPDATE_RELEASE_NOTES_MESSAGE = '暂无更新说明'

const ALLOWED_RELEASE_NOTE_TAGS = [
  'a',
  'blockquote',
  'br',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'ul',
] as const

const ALLOWED_RELEASE_NOTE_SCHEMES = /^(https?:|mailto:)/i

function resolveReleaseNotesWindow() {
  if (typeof window === 'undefined') {
    return null
  }

  return window
}

export function sanitizeUpdateReleaseNotesHtml(releaseNotes: string) {
  const releaseNotesWindow = resolveReleaseNotesWindow()
  const sourceHtml = releaseNotes || EMPTY_UPDATE_RELEASE_NOTES_MESSAGE

  if (!releaseNotesWindow) {
    return sourceHtml.trim() || EMPTY_UPDATE_RELEASE_NOTES_MESSAGE
  }

  const DOMPurify = createDOMPurify(releaseNotesWindow)
  const sanitized = DOMPurify.sanitize(sourceHtml, {
    ALLOWED_TAGS: [...ALLOWED_RELEASE_NOTE_TAGS],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  })

  const container = releaseNotesWindow.document.createElement('div')
  container.innerHTML =
    typeof sanitized === 'string' ? sanitized : String(sanitized)

  container.querySelectorAll('a').forEach(anchor => {
    const href = anchor.getAttribute('href')?.trim()

    if (!href || !ALLOWED_RELEASE_NOTE_SCHEMES.test(href)) {
      anchor.removeAttribute('href')
      anchor.removeAttribute('target')
      anchor.removeAttribute('rel')
      return
    }

    anchor.setAttribute('href', href)
    anchor.setAttribute('target', '_blank')
    anchor.setAttribute('rel', 'noreferrer noopener')
  })

  const normalized = container.innerHTML.trim()

  return normalized || EMPTY_UPDATE_RELEASE_NOTES_MESSAGE
}

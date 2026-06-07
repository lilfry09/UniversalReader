import type { ReaderProgressLocator, ReaderSettings } from '../../types'

export type EpubNavigationTarget = string | { fraction: number }

export function getInitialEpubNavigationTarget(
  initialLocator: ReaderProgressLocator | undefined,
  initialProgress: number,
  pageMode: ReaderSettings['pageMode']
): EpubNavigationTarget {
  if (initialLocator?.kind === 'epub') {
    if (pageMode === 'scroll') {
      if (typeof initialLocator.fraction === 'number') {
        return { fraction: initialLocator.fraction }
      }
      if (initialProgress > 0) {
        return { fraction: initialProgress }
      }
      return { fraction: 0 }
    }

    if (initialLocator.cfi) {
      return initialLocator.cfi
    }
    if (typeof initialLocator.fraction === 'number') {
      return { fraction: initialLocator.fraction }
    }
  }

  return { fraction: initialProgress > 0 ? initialProgress : 0 }
}

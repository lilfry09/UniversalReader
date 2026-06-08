import { contextBridge, ipcRenderer } from 'electron'

const allowedInvokeChannels = new Set([
  'open-file-dialog',
  'get-library',
  'search-library',
  'file-exists',
  'open-external',
  'open-user-data-folder',
  'read-file',
  'read-file-buffer',
  'get-cover-url',
  'update-progress',
  'delete-book',
  'get-annotations',
  'add-annotation',
  'update-annotation',
  'delete-annotation',
  'select-background-image',
  'get-background-image-url',
  'qa-load-book',
  'qa-ask',
  'qa-clear',
  'qa-get-status',
  'credentials-save',
  'credentials-load',
  'credentials-clear',
  'credentials-has',
])

contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke(channel: string, ...args: unknown[]) {
    if (!allowedInvokeChannels.has(channel)) {
      throw new Error(`IPC channel is not allowed: ${channel}`)
    }

    return ipcRenderer.invoke(channel, ...args)
  },
})

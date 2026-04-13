import test from 'node:test'
import assert from 'node:assert/strict'

import { useSearchDialogStore } from '../src/renderer/stores/search-dialog-store.ts'

test('search dialog store exposes explicit open and close actions', () => {
  useSearchDialogStore.setState({ open: false })

  useSearchDialogStore.getState().openDialog()
  assert.equal(useSearchDialogStore.getState().open, true)

  useSearchDialogStore.getState().closeDialog()
  assert.equal(useSearchDialogStore.getState().open, false)

  useSearchDialogStore.getState().setOpen(true)
  assert.equal(useSearchDialogStore.getState().open, true)
})

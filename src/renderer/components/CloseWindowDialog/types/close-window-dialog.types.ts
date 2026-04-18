export interface CloseWindowDialogProps {
  open: boolean
  setOpen: (value: boolean) => void
  handleCloseWindow: () => void
  handleMiniWindow: () => void
}

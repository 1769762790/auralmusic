type LxScriptExecutionScope = Record<string, unknown> & {
  lx?: unknown
}

export function executeLxScript(script: string, scope: LxScriptExecutionScope) {
  const runScript = new Function(
    'globalThisRef',
    'lx',
    `${script}\n//# sourceURL=lx-custom-source.js`
  ) as (globalThisRef: LxScriptExecutionScope, lx: unknown) => void

  runScript.call(scope, scope, scope.lx)
}

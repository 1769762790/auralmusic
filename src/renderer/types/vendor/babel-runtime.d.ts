declare module '@babel/runtime/helpers/asyncToGenerator' {
  const asyncToGenerator: <T extends (...args: never[]) => Generator>(
    generatorFn: T
  ) => (...args: Parameters<T>) => Promise<unknown>

  export default asyncToGenerator
}

declare module '@babel/runtime/helpers/regenerator' {
  type RegeneratorHelper = {
    w: (
      innerFn: (...args: unknown[]) => unknown,
      outerFn: unknown,
      self?: unknown,
      tryLocations?: unknown[]
    ) => Iterator<unknown>
    m: <T>(generatorFn: T) => T
  }

  const regenerator: () => RegeneratorHelper

  export default regenerator
}

declare module '@babel/runtime/helpers/regeneratorRuntime' {
  const regeneratorRuntime: () => {
    mark: <T>(generatorFn: T) => T
    wrap: (
      innerFn: (...args: unknown[]) => unknown,
      outerFn: unknown,
      self?: unknown,
      tryLocations?: unknown[]
    ) => Iterator<unknown>
  }

  export default regeneratorRuntime
}

declare module '@babel/runtime/helpers/typeof' {
  const babelTypeof: (value: unknown) => string

  export default babelTypeof
}

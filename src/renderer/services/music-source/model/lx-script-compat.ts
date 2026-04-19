import asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator'
import regenerator from '@babel/runtime/helpers/regenerator'
import regeneratorRuntime from '@babel/runtime/helpers/regeneratorRuntime'
import babelTypeof from '@babel/runtime/helpers/typeof'

type LxScriptCompatGlobalTarget = Record<string, unknown>

function regeneratorDefine(
  target: Record<string, unknown>,
  key?: string,
  value?: unknown,
  hidden?: boolean
) {
  let defineProperty: typeof Object.defineProperty | undefined =
    Object.defineProperty

  try {
    defineProperty({}, '', {})
  } catch {
    defineProperty = undefined
  }

  const assign = (
    object: Record<string, unknown>,
    propertyKey?: string,
    propertyValue?: unknown,
    propertyHidden?: boolean
  ) => {
    const defineIteratorMethod = (methodName: string, methodType: number) => {
      assign(
        object,
        methodName,
        function invokeIteratorMethod(
          this: { _invoke: (...args: unknown[]) => unknown },
          payload: unknown
        ) {
          return this._invoke(methodName, methodType, payload)
        }
      )
    }

    if (!propertyKey) {
      defineIteratorMethod('next', 0)
      defineIteratorMethod('throw', 1)
      defineIteratorMethod('return', 2)
      return
    }

    if (defineProperty) {
      defineProperty(object, propertyKey, {
        value: propertyValue,
        enumerable: !propertyHidden,
        configurable: !propertyHidden,
        writable: !propertyHidden,
      })
      return
    }

    object[propertyKey] = propertyValue
  }

  assign(target, key, value, hidden)
}

export function installLxScriptCompatGlobals(
  target: LxScriptCompatGlobalTarget
) {
  target.asyncGeneratorStep = function asyncGeneratorStep(
    generator: Iterator<unknown> & Record<string, (value?: unknown) => unknown>,
    resolve: (value: unknown) => void,
    reject: (reason?: unknown) => void,
    next: (value?: unknown) => void,
    throwNext: (value?: unknown) => void,
    key: 'next' | 'throw',
    arg: unknown
  ) {
    try {
      const invoke = generator[key]
      if (typeof invoke !== 'function') {
        reject(new TypeError(`Generator does not support ${key}`))
        return
      }

      const step = invoke(arg) as IteratorResult<unknown>
      const value = step.value

      if (step.done) {
        resolve(value)
        return
      }

      Promise.resolve(value).then(next, throwNext)
    } catch (error) {
      reject(error)
    }
  }
  target._asyncToGenerator = asyncToGenerator
  target._regenerator = regenerator
  target._regeneratorDefine2 = regeneratorDefine
  target._typeof = babelTypeof
  target.regeneratorRuntime = regeneratorRuntime()
}

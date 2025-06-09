// Constants
const INFINITY = 1 / 0
const symbolTag = '[object Symbol]'
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
  reHasRegExpChar = RegExp(reRegExpChar.source)

const freeSelf =
  typeof self == 'object' && self && self.Object === Object && self

const freeGlobal =
  typeof global == 'object' && global && global.Object === Object && global

const root = freeGlobal || freeSelf || Function('return this')()

const objectProto = Object.prototype

const objectToString = objectProto.toString

/** Built-in value references. */
const Symbol = root.Symbol

/** Used to convert symbols to primitives and strings. */
const symbolProto = Symbol ? Symbol.prototype : undefined,
  symbolToString = symbolProto ? symbolProto.toString : undefined

function baseToString(value: any): string {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : ''
  }
  const result = value + ''
  return result == '0' && 1 / value == -INFINITY ? '-0' : result
}

function isObjectLike(value) {
  return !!value && typeof value == 'object'
}

function isSymbol(value) {
  return (
    typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag)
  )
}

function toString(value) {
  return value == null ? '' : baseToString(value)
}

function escapeRegExp(string: string | RegExp): string {
  string = toString(string)
  return string && reHasRegExpChar.test(string)
    ? string.replace(reRegExpChar, '\\$&')
    : string
}

export default escapeRegExp

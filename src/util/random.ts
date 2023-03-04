export function choose<T>(elements: T[]): T {
  return elements[Math.floor(Math.random() * elements.length)]
}

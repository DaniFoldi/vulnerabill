export function unindent(template: TemplateStringsArray | string, ...values: unknown[]) {
  const templates = [ ...(typeof template === 'string' ? [ template ] : template) ]

  if (templates.length > 0) {
    templates[0].replace(/^\s*\n/, '')
    templates[templates.length - 1].replace(/\s*$/, '')
  }

  const minimumIndentationLength = templates.reduce((previous, t) => {
    return Math.min(previous, ...t.match(/^(\s+|(?!\s).)/gm)?.map(match => match.match(/\s/g)?.length ?? Number.MAX_SAFE_INTEGER) ?? [])
  }, Number.MAX_SAFE_INTEGER)

  const pattern = new RegExp(`^[\t ]{${minimumIndentationLength}}`, 'gm')
  const newTemplates = templates.map(str => str.replace(pattern, ''))
  let result = newTemplates[0]

  values.forEach((value, i) => {
    const endentations = result.match(/(?:^|\n)(?<level> *)$/)
    result += String(value)
      .split('\n')
      .map((str, i) => {
        return i === 0 ? str : `${endentations?.groups?.level ?? ''}${str}`
      })
      .join('\n') + newTemplates[i + 1]
  })
  return result
}

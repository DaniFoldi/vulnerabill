export type CheckResult = {
  score: 1 | 2 | 3 | 4 | 5
  message: string
  documentation: string[]
  confidence: 'low' | 'medium' | 'high'
}

export type CheckPlugin = {
  name: string
  description: string
  run: (site: string) => Promise<CheckResult>
}

export type OutputPlugin = {
  name: string
  action: (results: CheckResult[]) => Promise<void>
  error: (error: string) => Promise<void>
}

const RESULT_CLASS = {
  PASS: 'badge-on-track',
  FAIL: 'badge-delayed',
  BLOCKED: 'badge-priority-high',
  NOT_RUN: 'badge-dev',
}

const RESULT_LABEL = {
  PASS: 'Pass',
  FAIL: 'Fail',
  BLOCKED: 'Blocked',
  NOT_RUN: 'Not run',
}

export default function TestResultBadge({ result }) {
  const cls = RESULT_CLASS[result] || 'badge-dev'
  const label = RESULT_LABEL[result] || result
  return <span className={`badge ${cls}`}>{label}</span>
}
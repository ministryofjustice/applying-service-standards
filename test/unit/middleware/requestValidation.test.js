const { validatePath } = require('../../../middleware/request-validation')

function createMockRes () {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.send = vi.fn().mockReturnValue(res)
  return res
}

describe('validatePath middleware', () => {
  it('returns 400 and does not call next when normalised path contains ".."', () => {
    const req = { path: '/foo/..%2fbar' }
    const res = createMockRes()
    const next = vi.fn()

    validatePath(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Bad request')
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when normalised path does not contain ".."', () => {
    const req = { path: '/foo/bar' }
    const res = createMockRes()
    const next = vi.fn()

    validatePath(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
    expect(res.send).not.toHaveBeenCalled()
  })
})

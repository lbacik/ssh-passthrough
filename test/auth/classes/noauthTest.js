
const assert = require('chai').assert
const NoAuth = require('../../../src/auth/classes/noauth')

describe('NoAuth', function() {  
  it('auth method of the NoAuth class should always return true', function() {
    auth = new NoAuth()
    result = auth.auth(null, null)
    assert.isTrue(result)    
  })
})

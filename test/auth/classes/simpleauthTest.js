
const assert = require('chai').assert
const SimpleAuth = require('../../../src/auth/classes/simpleauth')


describe('SimpleAuth', function() {  

  describe('When initialised with null values', function() {
    
    const auth = new SimpleAuth(null, null)
    
    it('comparing with null values', function() {
      result = auth.auth(null, null)
      assert.isFalse(result)    
    })

    it('comparing with undefined values', function() {
      result = auth.auth(undefined, undefined)
      assert.isFalse(result)    
    })

  })

  describe('When initialised with undefined values', function() {
    
    const auth = new SimpleAuth(undefined, undefined)
    
    it('comparing with null values', function() {
      result = auth.auth(null, null)
      assert.isFalse(result)    
    })

    it('comparing with undefined values', function() {
      result = auth.auth(undefined, undefined)
      assert.isFalse(result)    
    })

  })

  describe('When initialised with some real values', function() {
    
    const auth = new SimpleAuth('foo', 'bar')
    
    it('comparing with null values', function() {
      result = auth.auth(null, null)
      assert.isFalse(result)    
    })

    it('comparing with undefined values', function() {
      result = auth.auth(undefined, undefined)
      assert.isFalse(result)    
    })
    
    it('comparing with wrong values', function() {
      const context = {
        username: 'abc',
        password: 'abc'
      }
      result = auth.auth(context, null)
      assert.isFalse(result)    
    })

    it('comparing with right values', function() {
      const context = {
        username: 'foo',
        password: 'bar'
      }
      result = auth.auth(context, null)
      assert.isTrue(result)    
    })

    it('comparing with right values (using overriding)', function() {
      const context = {
        username: 'abc',
        password: 'bar'
      }
      const overridenValues = {
        username: 'foo'
      }

      result = auth.auth(context, overridenValues)
      assert.isTrue(result)    
    })

  })
})

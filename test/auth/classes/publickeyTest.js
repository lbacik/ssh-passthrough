const assert = require('chai').assert
const sinon = require('sinon')
const PublicKey = require('../../../src/auth/classes/publickey')

describe('PublicKey', function() {  

    describe('readFile', function() {
        it('should return empty array when authorizedkeys file does not exist', function () {        
            const result = PublicKey.readKeyFile(null)
            assert.isArray(result)
            assert.isEmpty(result)
        })
    
        it('should return empty array when authorizedkeys file does not exist (2)', function () {
            const result = PublicKey.readKeyFile('/nonexisting_directory/file')
            assert.isArray(result)
            assert.isEmpty(result)
        })    
    })

    describe('getPubKey', function() {
        it('should return null when the input key is null', function() {
            const result = PublicKey.getPubKey(null)
            assert.isNull(result)
        })

        it('should return null when the passed string is not a valid ssh public key', function() {
            const result = PublicKey.getPubKey('wrongKey')
            assert.isNull(result)
        })

        it('should return object with information about key when gets valid key', function() {
            const testKey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDGY2lgdQkxVLO7IGGxb986NbzMyo'
                + 'ZANwqdyrMi1WRBNlhXTgFfRc9hQIAh54eBNzOy63LfOTTXgABCFvzmxbQMv/CuzYAC2ZdVVOM8My'
                + 'l56Bs7EZbhXpdoYLRhvBW9ma7Wqiv4G7tqIjrCrulPF/0HcSiMOboTe2IyPvAvEX7NbhKjmrm4TK'
                + 'zgc3dseuWkN00+wclktTygsVzg3VPQdPeuBtG0vVnh4T4VfG8tHTPkzZUAlVb+Vo9LQoTYlIXgnd'
                + '6I1OW761hsziWcXn16mFCkqNpOo5PziEoZoJwaj2+h+nOZWs+lEG2igWiJbF3m+zCgcRCXro5NN4'
                + 'I5VncqD7dJ test@key'
            const result = PublicKey.getPubKey(testKey)
            assert.isObject(result)
            assert.include(result, {type: 'rsa', fulltype: 'ssh-rsa'})
        })
    })

    describe('verifySignature', function() {
        it ('should return False in case of any problems', function() {
            const result = PublicKey.verifySignature(null, null)
            assert.isFalse(result)
        })
    })

    describe('auth, readKeyFile', function() {

        const nonExistingFile = '/existing_directory/file'

        after(() => {
            PublicKey.readKeyFile.restore()
        })

        it('auth should return false when authorizedkeys file do not exist', function () {
            const readKeyFileSpy = sinon.spy(PublicKey, 'readKeyFile')
            const publicKey = new PublicKey(nonExistingFile)
            const result = publicKey.auth(null, null)
            assert.isFalse(result)
            assert.isTrue(readKeyFileSpy.calledWith(nonExistingFile))
            assert.isTrue(readKeyFileSpy.calledOnce)
        })        
    })

    describe('auth', function() {

        const existingFile = '/existing_directory/file'
        const nonExistingFile = '/nonexisting_directory/file'
        const fakeContext = {
            key: {
                algo: 'foo'
            },
            signature: 'bar'
        }
        const fakeContextWithoutSignature = {
            key: {
                algo: 'foo'
            }
        }
        const fakePubKey = {
            fulltype: 'foo'
        }
        const keysArray = ['key01']

        let readKeyFileStub
        let getPubKeyStub
        let compareBuffersStub
        let verifySignatureStub

        before(() => {
            readKeyFileStub = sinon.stub(PublicKey, 'readKeyFile')
            getPubKeyStub = sinon.stub(PublicKey, 'getPubKey')
            compareBuffersStub = sinon.stub(PublicKey, 'compareBuffers')
            verifySignatureStub = sinon.stub(PublicKey, 'verifySignature')

            readKeyFileStub.withArgs(null).returns([])
            readKeyFileStub.withArgs(existingFile).returns(keysArray)
            getPubKeyStub.withArgs('key01').returns(fakePubKey)
        })

        after(() => {
            PublicKey.readKeyFile.restore()
            PublicKey.getPubKey.restore()
            PublicKey.compareBuffers.restore()
            PublicKey.verifySignature.restore()
        })
        
        const runs = [
            {
                description: 'should return False when authorizedKeysFile is not valid',
                authorizedKeysFile: null,
                context: null,
                compareBuffersResult: false,
                verifySignatureResult: false,
                result: false
            },
            {
                description: 'should return False when the given key is not an authorized one',
                authorizedKeysFile: existingFile,
                context: fakeContext,
                compareBuffersResult: false,
                verifySignatureResult: false,
                result: false
            },
            {
                description: 'should return False in case of failed signature verification',
                authorizedKeysFile: existingFile,
                context: fakeContext,
                compareBuffersResult: true,
                verifySignatureResult: false,
                result: false
            },
            {
                description: 'should return True if the key is authorized (and there is no signature)',
                authorizedKeysFile: existingFile,
                context: fakeContextWithoutSignature,
                compareBuffersResult: true,
                verifySignatureResult: false,
                result: true
            },
            {
                description: 'should return True if the key is authorized and signature verified ',
                authorizedKeysFile: existingFile,
                context: fakeContext,
                compareBuffersResult: true,
                verifySignatureResult: true,
                result: true
            },            
        ]

        runs.forEach(function(data) {
            it(data.description, function () {
                compareBuffersStub.returns(data.compareBuffersResult)
                verifySignatureStub.returns(data.verifySignatureResult)
                const publicKey = new PublicKey(data.authorizedKeysFile)
                const result = publicKey.auth(data.context, null)
                if (data.result === true) {
                    assert.isTrue(result)
                } else {
                    assert.isFalse(result)
                }
            })            
        })
    })
})

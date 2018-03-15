SandboxedModule = require('sandboxed-module')
assert = require('assert')
require('chai').should()
expect = require('chai').expect
sinon = require('sinon')
modulePath = require('path').join __dirname, '../../../../app/js/Features/History/RestoreManager'
Errors = require '../../../../app/js/Features/Errors/Errors'
tk = require("timekeeper")
moment = require('moment')

describe 'RestoreManager', ->
	beforeEach ->
		@RestoreManager = SandboxedModule.require modulePath, requires:
			'../../infrastructure/FileWriter': @FileWriter = {}
			'../Uploads/FileSystemImportManager': @FileSystemImportManager = {}
			'../Project/ProjectLocator': @ProjectLocator = {}
			'../Errors/Errors': Errors
			'logger-sharelatex': @logger = {log: sinon.stub(), err: sinon.stub()}
		@user_id = 'mock-user-id'
		@project_id = 'mock-project-id'
		@version = 42
		@callback = sinon.stub()
		tk.freeze Date.now() # freeze the time for these tests

	afterEach ->
		tk.reset()

	describe 'restoreFile', ->
		beforeEach ->
			@RestoreManager._writeFileVersionToDisk = sinon.stub().yields(null, @fsPath = "/tmp/path/on/disk")
			@RestoreManager._findFolderOrRootFolderId = sinon.stub().yields(null, @folder_id = 'mock-folder-id')
			@RestoreManager._addEntityWithUniqueName = sinon.stub().yields(null, @entity = 'mock-entity')

		describe "with a file not in a folder", ->
			beforeEach ->
				@pathname = 'foo.tex'
				@RestoreManager.restoreFile @user_id, @project_id, @version, @pathname, @callback

			it 'should write the file version to disk', ->
				@RestoreManager._writeFileVersionToDisk
					.calledWith(@project_id, @version, @pathname)
					.should.equal true

			it 'should find the root folder', ->
				@RestoreManager._findFolderOrRootFolderId
					.calledWith(@project_id, "")
					.should.equal true

			it 'should add the entity', ->
				@RestoreManager._addEntityWithUniqueName
					.calledWith(@user_id, @project_id, @folder_id, 'foo.tex', @fsPath)
					.should.equal true

			it 'should call the callback with the entity', ->
				@callback.calledWith(null, @entity).should.equal true


		describe "with a file in a folder", ->
			beforeEach ->
				@pathname = 'foo/bar.tex'
				@RestoreManager.restoreFile @user_id, @project_id, @version, @pathname, @callback

			it 'should find the folder', ->
				@RestoreManager._findFolderOrRootFolderId
					.calledWith(@project_id, "foo")
					.should.equal true

			it 'should add the entity by its basename', ->
				@RestoreManager._addEntityWithUniqueName
					.calledWith(@user_id, @project_id, @folder_id, 'bar.tex', @fsPath)
					.should.equal true

	describe '_findFolderOrRootFolderId', ->
		describe 'with a folder that exists', ->
			beforeEach ->
				@ProjectLocator.findElementByPath = sinon.stub().yields(null, {_id: @folder_id = 'mock-folder-id'}, 'folder')
				@RestoreManager._findFolderOrRootFolderId @project_id, 'folder_name', @callback

			it 'should look up the folder', ->
				@ProjectLocator.findElementByPath
					.calledWith({project_id: @project_id, path: 'folder_name'})
					.should.equal true

			it 'should return the folder_id', ->
				@callback.calledWith(null, @folder_id).should.equal true

		describe "with a folder that doesn't exist", ->
			beforeEach ->
				@ProjectLocator.findElementByPath = sinon.stub().yields(new Errors.NotFoundError())
				@RestoreManager._findFolderOrRootFolderId @project_id, 'folder_name', @callback

			it 'should return null', ->
				@callback.calledWith(null, null).should.equal true

	describe '_addEntityWithUniqueName', ->
		beforeEach ->
			@parent_folder_id = 'mock-folder-id'
			@fsPath = '/tmp/file/on/disk'
			@name = 'foo.tex'

		describe 'with a valid name', ->
			beforeEach ->
				@FileSystemImportManager.addEntity = sinon.stub().yields(null, @entity = 'mock-entity')
				@RestoreManager._addEntityWithUniqueName @user_id, @project_id, @parent_folder_id, @name, @fsPath, @callback

			it 'should add the entity', ->
				@FileSystemImportManager.addEntity
					.calledWith(@user_id, @project_id, @parent_folder_id, @name, @fsPath, false)
					.should.equal true

			it 'should return the entity', ->
				@callback.calledWith(null, @entity).should.equal true

		describe "with an invalid name", ->
			beforeEach ->
				@FileSystemImportManager.addEntity = sinon.stub()
				@FileSystemImportManager.addEntity.onFirstCall().yields(new Errors.InvalidNameError())
				@FileSystemImportManager.addEntity.onSecondCall().yields(null, @entity = 'mock-entity')
				@RestoreManager._addEntityWithUniqueName @user_id, @project_id, @parent_folder_id, @name, @fsPath, @callback

			it 'should try to add the entity with its original name', ->
				@FileSystemImportManager.addEntity
					.calledWith(@user_id, @project_id, @parent_folder_id, 'foo.tex', @fsPath, false)
					.should.equal true

			it 'should try to add the entity with a unique name', ->
				date = moment(new Date()).format('Do MMM YY H:mm:ss')
				@FileSystemImportManager.addEntity
					.calledWith(@user_id, @project_id, @parent_folder_id, "foo (Restored on #{date}).tex", @fsPath, false)
					.should.equal true

			it 'should return the entity', ->
				@callback.calledWith(null, @entity).should.equal true

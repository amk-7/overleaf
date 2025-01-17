// Pass settings to enable consistent unit tests from .js and .mjs modules
function projectHistoryURLWithFilestoreFallback(
  Settings,
  projectId,
  historyId,
  fileRef
) {
  const filestoreURL = `${Settings.apis.filestore.url}/project/${projectId}/file/${fileRef._id}`
  if (fileRef.hash) {
    return {
      url: `${Settings.apis.project_history.url}/project/${historyId}/blob/${fileRef.hash}`,
      fallbackURL: filestoreURL,
    }
  } else {
    return { url: filestoreURL }
  }
}

module.exports = { projectHistoryURLWithFilestoreFallback }

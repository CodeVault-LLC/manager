module.exports = {
  analyzeCommits: (pluginConfig, context) => {
    const { commits, logger } = context

    // Determine the release type based on commit messages
    let releaseType = null

    for (const commit of commits) {
      const message = commit.message || ''

      if (message.includes('BREAKING CHANGE') || message.startsWith('break:')) {
        return 'major' // First digit (1.x.xx)
      } else if (
        message.startsWith('feat:') ||
        message.startsWith('feature:') ||
        message.includes('FEATURE')
      ) {
        releaseType = 'minor' // Second digit (x.1.xx)
      } else if (
        !releaseType &&
        (message.startsWith('fix:') ||
          message.startsWith('perf:') ||
          message.startsWith('refactor:') ||
          message.startsWith('style:') ||
          message.startsWith('docs:'))
      ) {
        releaseType = 'patch' // Last two digits (x.x.01)
      }
    }

    logger.log('Determined release type: %s', releaseType)
    return releaseType
  },

  generateNotes: (pluginConfig, context) => {
    return null
  }
}

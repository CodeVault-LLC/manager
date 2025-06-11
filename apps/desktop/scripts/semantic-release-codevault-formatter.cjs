module.exports = {
  verifyConditions: (pluginConfig, context) => {
    // No verification needed
  },

  // This will be called to determine the next version
  prepare: (pluginConfig, context) => {
    const { nextRelease, logger } = context

    // Parse the current semantic version
    const [major, minor, patch] = nextRelease.version.split('.').map(Number)

    // Format to your custom scheme (padding patch with zeros if needed)
    const formattedPatch = String(patch).padStart(2, '0')
    const customVersion = `${major}.${minor}.${formattedPatch}`

    logger.log(
      'Formatted version from %s to %s',
      nextRelease.version,
      customVersion
    )

    // Update nextRelease.version to use our custom format
    nextRelease.version = customVersion
  }
}

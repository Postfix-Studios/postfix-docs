find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
find . -name "yarn-error.log" -type f -prune -exec rm -rf '{}' +
find . -name "package-lock.json" -type f -prune -exec rm -rf '{}' +
find . -name "yarn.lock" -type f -prune -exec rm -rf '{}' +
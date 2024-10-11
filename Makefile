clean:
	find . -type d -name "node_modules" -exec rm -rf '{}' +
	find . -type d -name ".next" -exec rm -rf '{}' +
	find . -type d -name ".turbo" -exec rm -rf '{}' +
	find . -type d -name "dist" -exec rm -rf '{}' +

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-gpu --disable-dev-shm-usage',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

module.exports = {
  packagerConfig: {
    asar: true,
    icon: '/src/assets/images/app_icon' // no file extension required
  },
  rebuildConfig: {},
  makers: [
    {
      makers: [
        {
          name: '@electron-forge/maker-squirrel',
          config: {
            author: "HoangQuan",
            descriptions: "tool By me",
          }
        }
      ]
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};

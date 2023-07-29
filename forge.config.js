module.exports = {
  packagerConfig: {
    asar: true,
    icon: '/src/assets/images/app_icon', // no file extension required
    "extraResource": [
      "./history",
      "./acconts",
      "./configs"
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        author: "HoangQuan",
        description: "tool By me",
        options: {
          icon: './src/assets/images/app_icon.png'
        }
      }
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

  hooks: {
    postPackage: async (forgeConfig, options) => {
      // Đưa các thư mục và tệp cần thiết vào cấu hình extraResources
      const extraResources = [
        { from: './src/assets', to: './src/assets' },
        { from: './acconts', to: './acconts' },
        { from: './configs', to: './configs' },
        { from: './history', to: './history' },
        // Thêm các thư mục và tệp khác cần thiết ở đây
      ];
      return Object.assign(forgeConfig, { packagerConfig: { extraResources } });
    }
  }
};

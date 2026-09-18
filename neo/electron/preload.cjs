const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('illusions', {
  desktop: true,
  name: 'Illusions',
});

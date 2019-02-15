import controllers from './controllers';

const init = (params: AppParams, callback: NodeBack<void>): void => {
  controllers(params);
  callback();
};

interface Header {
  plugins: { route: string; icon: string; name: string }[];
}

const adminMenu = (header: Header, callback: NodeBack<Header>): void => {
  header.plugins.push({
    route: '/plugins/customize',
    icon: 'fa-wrench',
    name: 'Customize',
  });
  callback(null, header);
};

export {
  init,
  adminMenu,
};

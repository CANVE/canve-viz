import {App} from '../../src/app';

class RouterStub {
  configure(handler) {
    handler(this);
  }
  map(routes) {
    this.routes = routes;
  }
}

describe('the App module', () => {
  var sut,
    mockedRouter;

  beforeEach(() => {
    mockedRouter = new RouterStub();
    sut = new App(mockedRouter);
    sut.configureRouter(mockedRouter, mockedRouter);
  });

  it('contains a router property', () => {
    expect(sut.router).toBeDefined();
  });

  it('configures the router title', () => {
    expect(sut.router.title).toEqual('CANVE');
  });

  it('should have a start route', () => {
    expect(sut.router.routes).toContain({
      route: ['','start'],
      name: 'start',
      moduleId: 'graph-view/start' 
    });
  });

});

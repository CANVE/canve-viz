export class App {
  configureRouter(config, router){
    config.title = 'CANVE';
    config.map([
      { route: ['', 'start'], name: 'start', moduleId: 'graph-view/start' },
    ]);

    this.router = router;
  }
}

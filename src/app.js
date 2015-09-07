export class App {
  configureRouter(config, router){
    config.title = 'CANVE';
    config.map([
      { route: ['', 'start'], name: 'start', moduleId: 'start' },
    ]);

    this.router = router;
  }
}

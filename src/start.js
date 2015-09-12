import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import 'fetch';

@inject(HttpClient)
export class Start {
  graphData = {};

  // TODO baseUrl should be configurable
  // Works given that serverLocalCORS.py is started in canve/visualizer
  constructor(http){
    http.configure(config => {
      config
        .withBaseUrl('http://localhost:31338/');
    });

    this.http = http;
  }

  // TODO Also need edges and some data cleaning - service?
  // TODO Background task for loading node-source files?
  activate() {
    return this.http.fetch('canve-data/nodes', { headers: { 'Content-Type': 'text/plain' } })
      .then(response => response.text())
      .then(nodes => {
        this.graphData.nodes = nodes;
        // TODO csv parsing, try: http://papaparse.com/
        console.dir(this.graphData);
      });
  }

}

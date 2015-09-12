import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import 'fetch';
import Papa from 'npm:papaparse@4.1.2/papaparse.js';

@inject(HttpClient)
export class Start {
  // graphData = {};

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
      .then(nodesText => {
        let parseResults = Papa.parse(nodesText, {header: true});
        console.dir(parseResults.data);
        // TODO: should check for parseResults.error
      });
  }

}

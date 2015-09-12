import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import 'fetch';
import Papa from 'npm:papaparse@4.1.2/papaparse.js';

@inject(HttpClient)
export class Start {
  graphData = {};

  // TODO baseUrl should be configurable
  // serverLocalCORS.py in canve/visualizer must be running
  constructor(http){
    http.configure(config => {
      config
        .withBaseUrl('http://localhost:31338/');
    });

    this.http = http;
  }

  fetchData(dataType) {
    // send and receive text/plain to avoid pre-flight OPTIONS request which simple python server can't do
    return this.http.fetch(`canve-data/${dataType}`, { headers: { 'Content-Type': 'text/plain' } })
      .then(edgesResponse => edgesResponse.text());
  }

  // TODO Data cleaning service?
  // TODO Background task for loading node-source files
  activate() {
    return Promise.all([
      this.fetchData('nodes'),
      this.fetchData('edges')
    ]).then(results => {
      this.graphData.nodes = Papa.parse(results[0], {header: true});
      this.graphData.edges = Papa.parse(results[1], {header: true});
      console.dir(this.graphData);
    }).catch(err => console.error(err.stack));
  }

}

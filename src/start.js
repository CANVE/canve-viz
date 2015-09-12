import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import 'fetch';
import Papa from 'npm:papaparse@4.1.2/papaparse.js';

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

  fetchNodes() {
      return this.http.fetch('canve-data/nodes', { headers: { 'Content-Type': 'text/plain' } })
        .then(nodesResponse => nodesResponse.text());
  }

  fetchEdges() {
      return this.http.fetch('canve-data/edges', { headers: { 'Content-Type': 'text/plain' } })
        .then(edgesResponse => edgesResponse.text());
  }

  // TODO Also need edges and some data cleaning - service?
  // TODO Background task for loading node-source files?
  // activate() {
  //   return this.http.fetch('canve-data/nodes', { headers: { 'Content-Type': 'text/plain' } })
  //     .then(nodesResponse => nodesResponse.text())
  //     .then(nodesText => Papa.parse(nodesText, {header: true}))
  //     .then(this.http.fetch('canve-data/edges', { headers: { 'Content-Type': 'text/plain' }}))
  //     // .then(edgesResponse => edgesResponse.text())
  //     // .then(edgesText => Papa.parse(edgesText, {header: true}))
  //     .catch(err => console.error(err.stack));
  // }
  activate() {
    return Promise.all([
      this.fetchNodes(),
      this.fetchEdges()
    ]).then(function(results) {
      console.dir(results);
    }).catch(err => console.error(err.stack));
  }

}

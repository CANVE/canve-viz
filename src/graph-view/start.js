import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import 'fetch';
import Papa from 'npm:papaparse@4.1.2/papaparse.js';
import {DataCleaner} from './data-cleaner';
import GraphModel from '../graph/graph-model';

@inject(HttpClient, DataCleaner, GraphModel)
export class Start {

  // TODO baseUrl should be configurable
  // serverLocalCORS.py in canve/visualizer must be running
  constructor(http, dataCleaner, graphModel, pubSub){
    http.configure(config => {
      config
        .withBaseUrl('http://localhost:31338/');
    });

    this.http = http;
    this.dataCleaner = dataCleaner;
    this.graphModel = graphModel;
  }

  fetchData(dataType) {
    // send and receive text/plain to avoid pre-flight OPTIONS request which simple python server can't do
    return this.http.fetch(`canve-data/${dataType}`, { headers: { 'Content-Type': 'text/plain' } })
      .then(edgesResponse => edgesResponse.text());
  }

  activate(params) {
    console.log(`=== ACTIVATE PARAMS: ${JSON.stringify(params)}`);
    return Promise.all([
      this.fetchData('nodes'),
      this.fetchData('edges')
    ]).then(results => {
      let rawNodes = Papa.parse(results[0], {header: true});
      let rawEdges = Papa.parse(results[1], {header: true});
      let graphData = {
        nodes: this.dataCleaner.cleanNodes(rawNodes.data),
        edges: this.dataCleaner.cleanEdges(rawEdges.data)
      };
      this.graphModel.populateModel(graphData);
      this.foo = this.graphModel.globalGraphModel;
      this.searchTerms = this.graphModel.globalGraphModel;
    }).catch(err => console.error(err.stack));
  }

}

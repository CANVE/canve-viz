import {DataCleaner} from '../../src/graph-view/data-cleaner';

describe('Data Cleaner', () => {

  let sut;

  beforeEach( () => {
    sut = new DataCleaner();
    expect(sut).toBeDefined();
  });

  it('Does something...', () => {
    expect(true).toBe(true);
  });

});

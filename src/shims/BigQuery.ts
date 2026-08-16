import { BigQueryStubs } from './generated/BigQuery.stubs.js';
import { BigQueryDatasetsStubs } from './generated/BigQueryDatasets.stubs.js';
import { BigQueryJobsStubs } from './generated/BigQueryJobs.stubs.js';
import { BigQueryProjectsStubs } from './generated/BigQueryProjects.stubs.js';
import { BigQueryTabledataStubs } from './generated/BigQueryTabledata.stubs.js';
import { BigQueryTablesStubs } from './generated/BigQueryTables.stubs.js';

// Composes the advanced BigQuery service's sub-collections onto its own
// (otherwise-empty) method surface — see #45. Stub-only, Local mode only, no
// Live-mode Google API bridging: every method throws GasPNotImplementedError
// until a matching Declared Fixture answers it.
class BigQueryDatasets extends BigQueryDatasetsStubs {}
class BigQueryJobs extends BigQueryJobsStubs {}
class BigQueryProjects extends BigQueryProjectsStubs {}
class BigQueryTabledata extends BigQueryTabledataStubs {}
class BigQueryTables extends BigQueryTablesStubs {}

class BigQuery extends BigQueryStubs {
  Datasets = new BigQueryDatasets();
  Jobs = new BigQueryJobs();
  Projects = new BigQueryProjects();
  Tabledata = new BigQueryTabledata();
  Tables = new BigQueryTables();
}

const instance = new BigQuery();
export { instance as BigQuery };

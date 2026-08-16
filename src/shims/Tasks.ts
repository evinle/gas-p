import { TasksStubs } from './generated/Tasks.stubs.js';
import { TasksTasklistsStubs } from './generated/TasksTasklists.stubs.js';
import { TasksTasksStubs } from './generated/TasksTasks.stubs.js';

// Composes the advanced Tasks service's sub-collections onto its own
// (otherwise-empty) method surface — see #45. Stub-only, Local mode only, no
// Live-mode Google API bridging: every method throws GasPNotImplementedError
// until a matching Declared Fixture answers it.
class TasksTasklists extends TasksTasklistsStubs {}
class TasksTasks extends TasksTasksStubs {}

class Tasks extends TasksStubs {
  Tasklists = new TasksTasklists();
  Tasks = new TasksTasks();
}

const instance = new Tasks();
export { instance as Tasks };

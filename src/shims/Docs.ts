import { DocsStubs } from './generated/Docs.stubs.js';
import { DocsDocumentsStubs } from './generated/DocsDocuments.stubs.js';

// Composes the advanced Docs service's sub-collection onto its own
// (otherwise-empty) method surface — see #45. Stub-only, Local mode only, no
// Live-mode Google API bridging: every method throws GasPNotImplementedError
// until a matching Declared Fixture answers it.
class DocsDocuments extends DocsDocumentsStubs {}

class Docs extends DocsStubs {
  Documents = new DocsDocuments();
}

const instance = new Docs();
export { instance as Docs };

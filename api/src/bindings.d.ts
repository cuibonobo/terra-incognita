interface Bindings {
  ENVIRONMENT: string,
  DATA: KVNamespace,
  LOGS: KVNamespace,
  messenger: DurableObjectNamespace,
  limiters: DurableObjectNamespace
}

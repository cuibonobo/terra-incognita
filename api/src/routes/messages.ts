import itty from 'itty-router';

const messengerName = 'messenger';
const messagesRouter = itty.Router({ base: '/messages' });

messagesRouter.get('/', async (request: Request, env: Bindings) => {
  const messengerId = env.messenger.idFromName(messengerName);
  const messenger = env.messenger.get(messengerId);
  return messenger.fetch(request);
});

export default messagesRouter;

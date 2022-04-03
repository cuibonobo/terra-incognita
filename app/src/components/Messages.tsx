import { h, Fragment } from 'preact';
import { useLocation } from 'react-router-dom';

export interface MessageItem {
  isError?: boolean,
  content: string
}

const Messages = (props: {messages: MessageItem[]}) => {
  const location = useLocation();

  // Don't display messages on the artwork page
  if (location.pathname === '/artwork') {
    return <Fragment />;
  }

  return (
    <div class="absolute top-0 left-0 w-full min-h-7 space-y-2">
      {props.messages.map((message: MessageItem) => {
          const containerColor = message.isError ? ' bg-rose-200 border-rose-500' : ' bg-sky-200 border-sky-500';
          const messageColor = message.isError ? ' text-stone-900' : ' text-slate-900';
          const buttonColor = message.isError ? ' bg-rose-500' : ' bg-sky-500';
          return (
            <div class={"w-full md:w-[32rem] flex flex-row border md:rounded border-solid mx-auto md:mt-2 items-center" + containerColor}>
              <div class={"grow py-1 px-2 text-sm" + messageColor}>{message.content}</div>
              <div class={"flex-none w-7 h-7 text-3xl leading-6 text-center align-middle text-white cursor-pointer" + buttonColor}>&#xd7;</div>
            </div>
          );
      })}
    </div>
  );
};

export default Messages;

import { h, Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import { useLocation } from 'react-router-dom';
import { useStore } from '../hooks';

const MAX_ALERTS = 4;

const Alert = (props: {idx: number, content: string, touchHandler: (idx: number) => void, isError?: boolean}) => {
  const containerColor = props.isError ? ' bg-rose-200 border-rose-500' : ' bg-sky-200 border-sky-500';
  const messageColor = props.isError ? ' text-stone-900' : ' text-slate-900';
  const buttonColor = props.isError ? ' bg-rose-500 hover:bg-rose-600' : ' bg-sky-500 hover:bg-sky-600';

  const onClick = () => {
    props.touchHandler(props.idx);
  };

  return (
    <div key={props.idx} class={"w-full md:w-[32rem] flex flex-row border md:rounded border-solid mx-auto md:mt-2 items-center" + containerColor}>
      <div class={"grow py-1 px-2 text-sm" + messageColor}>{props.content}</div>
      <div class={"flex-none w-7 h-7 text-3xl leading-6 text-center align-middle text-white cursor-pointer" + buttonColor} onClick={onClick}>&#xd7;</div>
    </div>
  );
};

const Alerts = () => {
  const {state, actions} = useStore();
  const location = useLocation();

  // Don't display messages on the artwork page
  if (location.pathname === '/artwork') {
    return <Fragment />;
  }

  const touchHandler = (idx: number) => {
    if (idx >= state.alerts.length) {
      return;
    }
    actions.updateAlerts(state.alerts.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    if (state.alerts.length > MAX_ALERTS) {
      actions.updateAlerts([...state.alerts.slice(-MAX_ALERTS)]);
    }
  }, [state.alerts]);

  return (
    <div class="absolute top-0 left-0 w-full min-h-7 space-y-2">
      {state.alerts.map((alert: AlertItem, idx: number) => <Alert idx={idx} content={alert.content} touchHandler={touchHandler} isError={alert.isError} />)}
    </div>
  );
};

export default Alerts;

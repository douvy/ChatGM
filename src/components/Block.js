import { useRouter } from 'next/router';
import injector from '../utils/DataInjector';

export default function Block({}) {
  return (
    <div className='fixed z-1 top-0 right-0 h-1/2 w-1/4 b-1-gray !important'>
      {injector.get('note')?.content}
    </div>
  );
}

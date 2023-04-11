export default function Debugger({ debuggerObject }) {
  return (
    <div className='mx-auto max-w-[760px] mt-3 md:mt-5'>
      <textarea
        className='w-full text-black'
        rows={10}
        defaultValue={JSON.stringify(debuggerObject, null, 2)}
      ></textarea>
    </div>
  );
}

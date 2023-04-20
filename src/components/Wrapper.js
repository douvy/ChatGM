import { useEffect } from 'react';

export default function Wrapper({ children }) {
  const { c, selected, setSelected } = children.props;
  console.log(children);
  useEffect(() => {
    switch (c.key) {
      case 'I':
        // setSelected('sidebar');
        // console.log(selected);
        break;
    }
  }, [c]);
  return <>{children}</>;
}

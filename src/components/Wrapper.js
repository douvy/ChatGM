import { useEffect } from 'react';

export default function Wrapper({ selected, setSelected, children }) {
  const { c } = children.props;
  useEffect(() => {
    switch (c.key) {
      case 'I':
        setSelected('sidebar');
        break;
      case 'Space':
        alert('space');
        break;
    }
    if (c.e?.code == 'Space' && c.e.altKey) {
      alert('space');
    }
  }, [c]);
  return <>{children}</>;
}

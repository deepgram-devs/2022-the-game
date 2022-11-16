import { forwardRef } from 'react';

export default forwardRef(function Row(
  {
    children,
    alignItems = 'flex-start',
    justifyContent = 'flex-start',
    style = {},
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems,
        justifyContent,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

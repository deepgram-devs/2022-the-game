import { forwardRef } from 'react';

export default forwardRef(function Col(
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
        flexDirection: 'column',
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

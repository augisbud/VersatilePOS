import { FC, PropsWithChildren } from 'react';
import './PageLayout.css';

export const PageLayout: FC<PropsWithChildren> = ({ children }) => {
  return <div className="page-layout">{children}</div>;
};

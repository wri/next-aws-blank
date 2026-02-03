import { ReactNode } from 'react';
import AssessmentNavbar from '@/components/static/AssessmentNavbar';

export default function AssessmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AssessmentNavbar />
      {children}
    </>
  );
}

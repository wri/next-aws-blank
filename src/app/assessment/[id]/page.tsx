'use client';

import { useParams } from 'next/navigation';

export default function AssessmentPage() {
  const params = useParams();
  const assessmentId = params.id as string;

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Assessment Engine
        </h1>
        <p className="text-gray-700 mb-4">
          Assessment ID: <code className="bg-gray-100 px-2 py-1 rounded">{assessmentId}</code>
        </p>
        <p className="text-gray-600">
          This is a placeholder for the assessment engine. The actual assessment questions and workflow will be implemented here.
        </p>
      </div>
    </div>
  );
}

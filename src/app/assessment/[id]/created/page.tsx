'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button, Modal } from '@worldresources/wri-design-systems';
import { AccessDetailsModal } from '@/components/assessment/AccessDetailsModal';
import './styles.css';
/**
  * Page shown after an assessment is created, displaying access details for the diagnostic.
 *
 * @deprecated This page is kept for backward compatibility; new flows should redirect users directly to the preparation page.
 */
export default function AssessmentCreatedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const assessmentId = params.id as string;
  
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    // Try to obtain the password from the URL query param on first load
    const tokenFromUrl = searchParams.get('token');

    if (typeof window === 'undefined') {
      // In non-browser environments we cannot access sessionStorage or manipulate the URL
      if (!tokenFromUrl) {
        setPasswordError(true);
      } else {
        setPassword(tokenFromUrl);
      }
      return;
    }

    if (tokenFromUrl) {
      // Store the password in sessionStorage for subsequent visits during this session
      const storageKey = `assessment-password-${assessmentId}`;
      window.sessionStorage.setItem(storageKey, tokenFromUrl);
      setPassword(tokenFromUrl);
      setPasswordError(false);

      // Remove the sensitive token from the URL to avoid it being leaked via referrers, history, etc.
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());
      } catch {
        // If URL manipulation fails, continue without throwing
      }

      return;
    }

    // If there is no token in the URL, attempt to restore it from sessionStorage
    const storageKey = `assessment-password-${assessmentId}`;
    const storedPassword = window.sessionStorage.getItem(storageKey);

    if (storedPassword) {
      setPassword(storedPassword);
      setPasswordError(false);
    } else {
      // No password available – mark as error so the UI can react
      setPasswordError(true);
    }
  }, [assessmentId, searchParams]);

  const handleContinue = () => {
    router.push(`/assessment/${assessmentId}/preparation`);
  };

  // If password is missing or expired, redirect back to setup with an error
  if (passwordError) {
    return (
      <Modal
        open={true}
        onClose={() => router.push('/assessment/setup')}
        size="medium"
        header="Session expired"
        blocking={true}
        content={
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              The access credentials for this diagnostic are no longer available. 
              Please create a new diagnostic or use your saved link and password to access an existing one.
            </p>
            <Button
              label="Back to setup"
              variant="primary"
              size="default"
              onClick={() => router.push('/assessment/setup')}
            />
          </div>
        }
      />
    );
  }

  return (
    <AccessDetailsModal
      open={true}
      assessmentId={assessmentId}
      password={password}
      onContinue={handleContinue}
    />
  );
}
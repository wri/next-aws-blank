'use client';

import { useState } from 'react';
import { Button, Modal } from '@worldresources/wri-design-systems';

export default function TestModalPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [isBlocking, setIsBlocking] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [hasTitle, setHasTitle] = useState(true);
  const [hasDescription, setHasDescription] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">WRI Modal Test Page</h1>
        
        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Modal Controls</h2>
          
          <div className="space-y-4">
            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Modal Size:</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setModalSize('small')}
                  className={`px-4 py-2 rounded ${
                    modalSize === 'small' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Small
                </button>
                <button
                  onClick={() => setModalSize('medium')}
                  className={`px-4 py-2 rounded ${
                    modalSize === 'medium' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setModalSize('large')}
                  className={`px-4 py-2 rounded ${
                    modalSize === 'large' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Large
                </button>
                <button
                  onClick={() => setModalSize('xlarge')}
                  className={`px-4 py-2 rounded ${
                    modalSize === 'xlarge' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Extra Large
                </button>
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isBlocking}
                  onChange={(e) => setIsBlocking(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Blocking mode (prevents backdrop close)</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isDraggable}
                  onChange={(e) => setIsDraggable(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Draggable</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasTitle}
                  onChange={(e) => setHasTitle(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Show title</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasDescription}
                  onChange={(e) => setHasDescription(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Show description</span>
              </label>
            </div>

            {/* Open Modal Button */}
            <div className="pt-4">
              <Button
                label="Open Modal"
                variant="primary"
                onClick={() => setIsOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Modal Documentation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
{`<Modal
  isOpen={${isOpen}}
  onClose={() => setIsOpen(false)}
  size="${modalSize}"${hasTitle ? `\n  title="Test Modal"` : ''}${hasDescription ? `\n  description="This is a test modal description"` : ''}${isBlocking ? '\n  blocking={true}' : ''}${isDraggable ? '\n  draggable={true}' : ''}
>
  {/* Modal content */}
</Modal>`}
          </pre>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-sm mb-2">Modal Features:</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• <strong>Size:</strong> small, medium, large, xlarge</li>
              <li>• <strong>Blocking:</strong> Prevents closing via backdrop click</li>
              <li>• <strong>Draggable:</strong> Allows dragging the modal around</li>
              <li>• <strong>Close button:</strong> Built-in (calls onClose)</li>
              <li>• <strong>Title/Description:</strong> Optional header props</li>
            </ul>
          </div>
        </div>
      </div>

      {/* The Modal */}
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        size={modalSize}
        header={hasTitle ? "Test Modal" : undefined}
        blocking={isBlocking}
        draggable={isDraggable}
        content={
          <div className="p-6 space-y-4">
            <p className="text-gray-700">
              This is the modal content area. Test the following features:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Modal opening and closing (X button or ESC key)</li>
              <li>Different sizes (small, medium, large, xlarge)</li>
              <li>Backdrop click behavior (disabled when blocking mode is on)</li>
              <li>Draggable functionality (when enabled)</li>
              <li>Content overflow handling</li>
              <li>Title and description toggling</li>
            </ul>

            <div className="pt-4 flex gap-3">
              <Button
                label="Primary Action"
                variant="primary"
                onClick={() => {
                  alert('Primary action clicked!');
                }}
              />
              <Button
                label="Close Modal"
                variant="secondary"
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}

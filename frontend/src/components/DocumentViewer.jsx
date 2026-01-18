import { useEffect, useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';

import axiosClient from '../assets/js/axios-client';

export default function DocumentViewer({ documentId }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const thumbnailPluginInstance = thumbnailPlugin();
  const { Thumbnails } = thumbnailPluginInstance;

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      {
        title: 'Thumbnails',
        content: <Thumbnails />,
      },
      ...defaultTabs.slice(1),
    ],
    toolbarPlugin: {
      zoomPlugin: { enableShortcuts: true },
      rotatePlugin: { enableShortcuts: true },
      downloadPlugin: true,
      printPlugin: true,
      fullScreenPlugin: true,
    },
  });

  useEffect(() => {
    const getFile = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/records/documents/${documentId}`);
        if (response.data.success && response.data.fileUrl) {
          setFileUrl(response.data.fileUrl);
        } else {
          setError('No file URL returned');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    getFile();
  }, [documentId]);

  if (loading) {
    return <div>Loading document...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!fileUrl) {
    return <div>No document available</div>;
  }

  return (
    <div style={{ height: '90vh', border: '1px solid #ddd', overflow: 'hidden' }}>
      <Worker workerUrl={new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString()}>
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance, thumbnailPluginInstance]}
          onDocumentLoad={(e) => {
            console.log('PDF loaded, pages:', e.doc.numPages);
            // setNumPages(e.doc.numPages); // if you still need it
          }}
        />
      </Worker>
    </div>
  );
}

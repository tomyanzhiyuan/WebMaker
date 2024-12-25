import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const WebsiteGenerator = () => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [generatedWebsite, setGeneratedWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('description', description);
    files.forEach(file => {
      formData.append('inspiration_images', file);
    });

    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGeneratedWebsite(data.html);
    } catch (error) {
      setError('Failed to generate website. Please try again.');
      console.error('Generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">AI Website Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your website's vibe
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E.g., Modern minimalist portfolio with earth tones, lots of whitespace..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload inspiration images (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                accept="image/*"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <span className="text-sm text-gray-600">
                  Drop images here or click to upload
                </span>
                {files.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    {files.length} file(s) selected
                  </p>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !description.trim()}
            className={`w-full py-2 px-4 rounded-md text-white font-medium
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isLoading ? 'Generating...' : 'Generate Website'}
          </button>
        </form>

        {generatedWebsite && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Generated Website</h2>
            <iframe
              srcDoc={generatedWebsite}
              className="w-full h-96 border rounded-md"
              title="Generated Website Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteGenerator;
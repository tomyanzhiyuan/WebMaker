// WebsiteGenerator.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Save, ExternalLink, List } from 'lucide-react';

const WebsiteGenerator = () => {
 const [description, setDescription] = useState('');
 const [files, setFiles] = useState([]);
 const [generatedWebsite, setGeneratedWebsite] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');
 const [savedWebsites, setSavedWebsites] = useState([]);
 const [websiteTitle, setWebsiteTitle] = useState('');
 const [isSaving, setIsSaving] = useState(false);
 const [showSavedWebsites, setShowSavedWebsites] = useState(false);

 useEffect(() => {
   fetchSavedWebsites();
 }, []);

 const fetchSavedWebsites = async () => {
   try {
     const response = await fetch('http://localhost:8000/api/websites/', {
       method: 'GET',
       headers: {
         'Accept': 'application/json',
       },
       mode: 'cors',
       credentials: 'include',
     });
     console.log('Fetch saved websites response:', response.status);
     if (response.ok) {
       const data = await response.json();
       console.log('Saved websites data:', data);
       setSavedWebsites(data);
     }
   } catch (error) {
     console.error('Failed to fetch saved websites:', error);
   }
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   console.log('Form submission started');
   setIsLoading(true);
   setError('');

   const formData = new FormData();
   formData.append('description', description);
   files.forEach(file => {
     formData.append('inspiration_images', file);
   });

   try {
     console.log('Sending request to generate website...');
     console.log('Description:', description);
     console.log('Number of files:', files.length);
     
     const response = await fetch('http://localhost:8000/api/generate-website', {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
       },
       body: formData,
       mode: 'cors',
       credentials: 'include',
     });
     
     console.log('Response status:', response.status);
     
     if (!response.ok) {
       const errorData = await response.text();
       console.error('Server error response:', errorData);
       throw new Error(`HTTP error! status: ${response.status}`);
     }
     
     const data = await response.json();
     console.log('Generated HTML length:', data.html?.length);
     console.log('First 100 chars:', data.html?.substring(0, 100));
     
     if (!data.html) {
       throw new Error('No HTML content received from server');
     }

     setGeneratedWebsite(data.html);
     setWebsiteTitle(description.split(' ').slice(0, 3).join(' '));
   } catch (error) {
     console.error('Generation error:', error);
     setError(`Failed to generate website: ${error.message}`);
   } finally {
     setIsLoading(false);
   }
 };

 const saveWebsite = async () => {
   if (!websiteTitle.trim()) {
     setError('Please enter a title for your website');
     return;
   }

   setIsSaving(true);
   const formData = new FormData();
   formData.append('title', websiteTitle);
   formData.append('description', description);
   formData.append('html_content', generatedWebsite);

   try {
     console.log('Saving website...');
     console.log('Title:', websiteTitle);
     
     const response = await fetch('http://localhost:8000/api/websites/', {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
       },
       body: formData,
       mode: 'cors',
       credentials: 'include',
     });

     console.log('Save response status:', response.status);

     if (!response.ok) {
       const errorText = await response.text();
       console.error('Save error response:', errorText);
       throw new Error('Failed to save website');
     }

     const data = await response.json();
     console.log('Save response data:', data);
     
     await fetchSavedWebsites();
     setError('');
     alert(`Website saved successfully! Permanent URL: ${window.location.origin}${data.permanent_url}`);
   } catch (error) {
     console.error('Save error:', error);
     setError(`Failed to save website: ${error.message}`);
   } finally {
     setIsSaving(false);
   }
 };

 const openInNewTab = () => {
   if (generatedWebsite) {
     try {
       const blob = new Blob([generatedWebsite], { type: 'text/html' });
       const url = URL.createObjectURL(blob);
       window.open(url, '_blank');
     } catch (error) {
       console.error('Error opening preview:', error);
       setError('Failed to open preview');
     }
   }
 };

 return (
   <div className="max-w-4xl mx-auto p-6">
     <div className="bg-white rounded-lg shadow-lg p-6">
       <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-gray-800">AI Website Generator</h1>
         <button
           onClick={() => setShowSavedWebsites(!showSavedWebsites)}
           className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
         >
           <List className="h-4 w-4" />
           {showSavedWebsites ? 'Hide' : 'Show'} Saved Websites
         </button>
       </div>

       {showSavedWebsites && (
         <div className="mb-8 border rounded-lg p-4">
           <h2 className="text-lg font-semibold mb-4">Saved Websites</h2>
           {savedWebsites.length > 0 ? (
             <div className="space-y-4">
               {savedWebsites.map((website) => (
                <div key={website.url_slug} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <h3 className="font-medium">{website.title}</h3>
                    <p className="text-sm text-gray-600">{website.description}</p>
                  </div>
                  <a
                    href={website.permanent_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View
                  </a>
                </div>
               ))}
             </div>
           ) : (
             <p className="text-gray-600">No saved websites yet.</p>
           )}
         </div>
       )}
       
       <form onSubmit={handleSubmit} className="space-y-6">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Describe your website&apos;s vibe
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
           <div className="mb-4 space-y-4">
             <div className="flex gap-4">
               <button
                 onClick={openInNewTab}
                 className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
               >
                 Preview Full Website
               </button>
               <button
                 onClick={saveWebsite}
                 disabled={isSaving}
                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
               >
                 <Save className="h-4 w-4" />
                 {isSaving ? 'Saving...' : 'Save Website'}
               </button>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Website Title
               </label>
               <input
                 type="text"
                 value={websiteTitle}
                 onChange={(e) => setWebsiteTitle(e.target.value)}
                 className="w-full p-2 border border-gray-300 rounded-md"
                 placeholder="Enter a title for your website"
               />
             </div>

             <iframe
               srcDoc={generatedWebsite}
               className="w-full h-96 border rounded-md"
               title="Generated Website Preview"
             />
           </div>
         </div>
       )}
     </div>
   </div>
 );
};

export default WebsiteGenerator;
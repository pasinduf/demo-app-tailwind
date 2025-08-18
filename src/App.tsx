import React, { useEffect, useState } from "react";
import "./App.css";
import { ClipboardIcon, RefreshIcon } from "@heroicons/react/outline";
import axios from "axios";
import { API_URL } from "./constants";

const App = () => {
  const [platform, setPlatform] = useState("");
  const [language, setLanguage] = useState("");
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);


  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [articleId, setArticleId] = useState<any>(null);
  const [content, setContent] = useState<any>(null);

  const platforms = [
    { value: "Facebook", label: "Facebook" },
    { value: "Twitter", label: "Twitter" },
    { value: "LinkedIn", label: "LinkedIn" },
    { value: "TikTok", label: "TikTok" },
  ];


  const languages = [
    { value: "English", label: "English" },
    { value: "Sinhala", label: "Sinhala" },
  ];



  useEffect(() => {
    if (!articleId) return;

    // Open SSE connection
    const eventSource = new EventSource(`${API_URL}/article/status/${articleId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === "Completed") {
        eventSource.close();
        getContent(articleId);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
      setProcessing(false)
    };

    return () => {
      eventSource.close();
    };
  }, [articleId]);


  const getContent = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/article/content/${id}`);
      setContent(response.data);
    } catch (error) {
      console.error("Error fetching article content:", error);
    }finally{
      setProcessing(false);
    }
  };


  const handleSubmit = (e:any) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setShowModal(false);

    try {
      const payload = {
        platform,
        language,
        title,
        keywords: [],
      };
      const response = await axios.post(`${API_URL}/article`, payload);
      if(response) {
        setProcessing(true);
        setArticleId(response.data?.id);
      }
      
    } catch (err: any) {
      console.error("Error submitting form:", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    
  };

  const handleCopy = (text:string, type:string) => {
    navigator.clipboard.writeText(text);
  };


  const onRefresh = () => {
    setPlatform("");
    setLanguage("");
    setTitle("");
    setContent(null);
    setArticleId(null);
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 p-6 md:p-8">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center justify-between">
            <span>✍️ Submit Form</span>
            <RefreshIcon className="h-6 w-6 text-gray-600 hover:text-indigo-600 cursor-pointer" onClick={onRefresh} />
          </h2>

          {/* Dropdown */}
          <label className="block mb-4">
            <span className="text-gray-700">Platform</span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            >
              <option>Select a platform</option>
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            >
              <option>Select a language</option>
              {languages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>

          {/* Textarea */}
          <label className="block mb-6">
            <span className="text-gray-700">Title / Description</span>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={5}
              placeholder="Enter detailed text here..."
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring focus:ring-indigo-200 resize-none"
            ></textarea>
          </label>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              disabled={submitting || processing}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Submit
            </button>
            <button className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-400 transition" onClick={handleCancel}>
              Cancel submit
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Empty Box */}
      <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-8">
        {articleId ? (
          <div
            className={`w-full border-2 border-dashed border-gray-400 rounded-xl bg-white p-6 flex 
            ${processing ? "md:h-[16rem] min-h-[100%]" : "min-h-[100%]"}`}
          >
            {processing ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                {/* <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">⏳ Your article is preparing</h3>
                <p className="text-gray-600 text-center leading-relaxed">It will be ready in just a few moments...</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 w-full">
                <div className="flex items-center justify-between">
                  {content && (
                    <>
                      <h3 className="text-xl font-semibold text-gray-800">{content.title}</h3>
                      <button className="ml-2 text-gray-500 hover:text-gray-800" onClick={() => handleCopy(content.title, "title")}>
                        <ClipboardIcon className="w-5 h-5 -mr-3" />
                      </button>
                    </>
                  )}
                </div>

                <div className="relative">
                  {content && (
                    <>
                      <p className="text-gray-600 leading-relaxed">{content && content.content}</p>
                      <button className="absolute top-0 right-0 text-gray-500 hover:text-gray-800" onClick={() => handleCopy(content.content, "content")}>
                        <ClipboardIcon className="w-5 h-5 -mr-3" />
                      </button>
                    </>
                  )}
                </div>

                {/* {copied.title && <span className="text-green-600 text-sm">Title copied!</span>}
                {copied.content && <span className="text-green-600 text-sm">Content copied!</span>} */}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full border-2 border-dashed border-gray-400 rounded-xl bg-white p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Submit Details</h3>
              <p className="text-gray-600 leading-relaxed"> Your article preview will appear here once it’s ready. </p>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowModal(false)}></div>

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 lg:p-8 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Submission</h3>
              <p className="text-slate-600">Are you sure you want to submit this form?</p>
            </div>

            {/* Modal Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

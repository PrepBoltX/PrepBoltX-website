import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import AnimatedCard from '../common/AnimatedCard';
import ProgressBar from '../common/ProgressBar';

const ResumeAnalyzer = () => {
  const { state } = useApp();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);

  // Resume analysis metrics
  const analysisMetrics = [
    { id: 'ats_score', name: 'ATS Compatibility', description: 'How well your resume works with Applicant Tracking Systems' },
    { id: 'skills_match', name: 'Skills Match', description: 'Alignment between your skills and industry requirements' },
    { id: 'impact_statements', name: 'Impact Statements', description: 'Quality of achievement descriptions and metrics' },
    { id: 'formatting', name: 'Formatting', description: 'Layout, readability, and visual structure' },
    { id: 'keywords', name: 'Keywords Optimization', description: 'Use of relevant industry and role-specific keywords' }
  ];

  // For demo purposes, we'll simulate the upload and analysis process
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Reset states
      setFile(selectedFile);
      setAnalysisResults(null);
      setError(null);
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    // Reset states
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);
      simulateAnalysis();
    }, 3000);
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);

    // Simulate analysis process with a delay
    setTimeout(() => {
      // Generate mock analysis results
      const results = {
        overall_score: Math.floor(Math.random() * 30) + 70, // 70-100 range
        metrics: {
          ats_score: Math.floor(Math.random() * 40) + 60,
          skills_match: Math.floor(Math.random() * 30) + 70,
          impact_statements: Math.floor(Math.random() * 50) + 50,
          formatting: Math.floor(Math.random() * 20) + 80,
          keywords: Math.floor(Math.random() * 35) + 65
        },
        strengths: [
          'Strong technical skills section with relevant technologies',
          'Clear work history with chronological format',
          'Education section is well-structured'
        ],
        weaknesses: [
          'Impact statements could be stronger with more quantifiable results',
          'Some industry-specific keywords are missing',
          'Too much text density in certain sections'
        ],
        suggestions: [
          {
            section: 'Work Experience',
            issues: [
              'Add more measurable achievements (e.g., "increased efficiency by 30%" instead of "improved efficiency")',
              'Use more action verbs at the beginning of bullet points',
              'Consider adding context to projects (team size, budget, etc.)'
            ]
          },
          {
            section: 'Skills',
            issues: [
              'Group skills by category for better readability',
              'Add proficiency level indicators for technical skills',
              'Include more soft skills relevant to teamwork and communication'
            ]
          },
          {
            section: 'Formatting',
            issues: [
              'Maintain consistent spacing between sections',
              'Consider using bullets instead of paragraphs for better readability',
              'Ensure consistent date formatting throughout'
            ]
          }
        ],
        keywords_missing: [
          'Agile methodologies',
          'CI/CD pipeline',
          'Cross-functional collaboration',
          'Problem-solving',
          'User experience'
        ],
        ats_issues: [
          'Complex tables may not parse correctly',
          'Consider using a more standard format for contact information',
          'Remove headers and footers that may confuse ATS systems'
        ]
      };

      setAnalysisResults(results);
      setIsAnalyzing(false);
    }, 5000);
  };

  const renderAnalysisResults = () => {
    if (!analysisResults) return null;

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Resume Analysis Results</h2>
        
        {/* Overall score */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Overall Score</h3>
          <div className="w-36 h-36 rounded-full border-8 border-blue-500 flex items-center justify-center mx-auto">
            <span className="text-4xl font-bold text-blue-600">{analysisResults.overall_score}</span>
          </div>
          <p className="mt-4 text-gray-600">
            {analysisResults.overall_score >= 90 ? 'Excellent resume! Ready for applications.' :
             analysisResults.overall_score >= 80 ? 'Strong resume with minor improvements needed.' :
             analysisResults.overall_score >= 70 ? 'Good foundation, but needs some work.' :
             'Your resume needs significant improvements.'}
          </p>
        </div>
        
        {/* Detailed metrics */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Metrics</h3>
          <div className="space-y-6">
            {analysisMetrics.map(metric => {
              const score = analysisResults.metrics[metric.id];
              let scoreColor = 'bg-red-500';
              if (score >= 80) scoreColor = 'bg-green-500';
              else if (score >= 70) scoreColor = 'bg-blue-500';
              else if (score >= 60) scoreColor = 'bg-yellow-500';
              
              return (
                <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-1">
                    <div>
                      <h4 className="font-medium text-gray-800">{metric.name}</h4>
                      <p className="text-sm text-gray-500">{metric.description}</p>
                    </div>
                    <span className="font-semibold text-gray-800">{score}%</span>
                  </div>
                  <ProgressBar 
                    progress={score} 
                    className="h-2 bg-gray-200" 
                    barClassName={scoreColor}
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Strengths and weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              <span className="text-green-500 mr-2">✓</span> Strengths
            </h3>
            <ul className="space-y-3">
              {analysisResults.strengths.map((strength, index) => (
                <li key={index} className="flex">
                  <span className="text-green-500 mr-2">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              <span className="text-red-500 mr-2">✗</span> Areas to Improve
            </h3>
            <ul className="space-y-3">
              {analysisResults.weaknesses.map((weakness, index) => (
                <li key={index} className="flex">
                  <span className="text-red-500 mr-2">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Suggestions by section */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Improvement Suggestions</h3>
          <div className="space-y-6">
            {analysisResults.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">{suggestion.section}</h4>
                <ul className="space-y-2">
                  {suggestion.issues.map((issue, i) => (
                    <li key={i} className="flex items-baseline">
                      <span className="text-blue-500 mr-2 text-xs">►</span>
                      <span className="text-gray-700">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Keywords and ATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Missing Keywords
            </h3>
            <p className="text-gray-600 mb-3">Consider adding these relevant keywords:</p>
            <div className="flex flex-wrap gap-2">
              {analysisResults.keywords_missing.map((keyword, index) => (
                <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              ATS Optimization
            </h3>
            <ul className="space-y-3">
              {analysisResults.ats_issues.map((issue, index) => (
                <li key={index} className="flex">
                  <span className="text-orange-500 mr-2">⚠</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-4 mb-8">
          <button className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50">
            Download Report
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
            Request Expert Review
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Resume Analyzer</h2>
      <p className="text-gray-600 mb-6">
        Upload your resume for AI-powered analysis and get personalized feedback to improve your chances.
      </p>
      
      {!analysisResults && (
        <div className="bg-white shadow-md rounded-xl p-8 max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Upload Your Resume</h3>
            <p className="text-gray-500 mt-1">Supported formats: PDF, DOCX</p>
          </div>
          
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="resume-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
              >
                Click to browse files
              </label>
              
              {file && (
                <div className="mt-4">
                  <div className="bg-gray-100 rounded-md p-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{file.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {isUploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {isAnalyzing && (
            <div className="mb-6">
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700 font-medium">Analyzing your resume...</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading || isAnalyzing}
              className={`
                px-6 py-3 rounded-md font-medium 
                ${(!file || isUploading || isAnalyzing) ? 
                  'bg-gray-300 text-gray-500 cursor-not-allowed' :
                  'bg-blue-600 text-white hover:bg-blue-700'}
              `}
            >
              {isUploading ? 'Uploading...' : 
               isAnalyzing ? 'Analyzing...' : 
               'Analyze Resume'}
            </button>
          </div>
        </div>
      )}
      
      {renderAnalysisResults()}
    </div>
  );
};

export default ResumeAnalyzer; 
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import JsonDisplay from '../components/JsonDisplay';
import IpynbPreview from '../components/IpynbPreview';
import ConfirmModal from '../components/ConfirmModal';

const HomePage = () => {
    const [jsonData, setJsonData] = useState(null);
    const [ipynbPreviewContent, setIpynbPreviewContent] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [activeFileId, setActiveFileId] = useState(null);
    const [activeJsonFileId, setActiveJsonFileId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileIdToDelete, setFileIdToDelete] = useState(null);

    const checkedFiles = selectedFiles.filter(f => f.isChecked);

    const previewSectionRef = useRef(null);
    const containerRef = useRef(null);

    const handleFileSelect = (files) => {
        setSelectedFiles(files);
        if (files.length > 0 && !files.some(f => f.id === activeFileId)) {
            const firstFileId = files[0].id;
            setActiveFileId(firstFileId);
            setActiveJsonFileId(firstFileId);
        }
    };

    const handleTabChange = (fileId) => {
        setActiveFileId(fileId);
    };

    const handleJsonTabChange = (fileId) => {
        setActiveJsonFileId(fileId);
    };

    const handleDeleteRequest = (id) => {
        setFileIdToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        if (!fileIdToDelete) return;

        const newFiles = selectedFiles.filter(f => f.id !== fileIdToDelete);
        setSelectedFiles(newFiles);

        // If the deleted file was the active one, select a new active file
        if (activeFileId === fileIdToDelete) {
            const newActiveId = newFiles.length > 0 ? newFiles[0].id : null;
            setActiveFileId(newActiveId);
            setActiveJsonFileId(newActiveId);
        }
        
        // Close modal and reset
        setIsModalOpen(false);
        setFileIdToDelete(null);
    };

    const handleCheckboxChange = (id) => {
        setSelectedFiles(prevFiles =>
            prevFiles.map(f =>
                f.id === id ? { ...f, isChecked: !f.isChecked } : f
            )
        );
    };

    const handleAddFiles = (newlyBrowsedFiles) => {
        const newFiles = Array.from(newlyBrowsedFiles).map(file => ({
            id: `${file.name}-${file.lastModified}`,
            file: file,
            isChecked: true, // New files are checked by default
        }));

        setSelectedFiles(prevFiles => {
            // Filter out duplicates based on id (name + lastModified)
            const uniqueNewFiles = newFiles.filter(nf => !prevFiles.some(pf => pf.id === nf.id));
            return [...prevFiles, ...uniqueNewFiles];
        });
    };

    useEffect(() => {
        if (activeFileId) {
            const activeFile = selectedFiles.find(f => f.id === activeFileId);
            if (activeFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setIpynbPreviewContent(e.target.result);
                };
                reader.readAsText(activeFile.file);
            }
        }
    }, [activeFileId, selectedFiles]);

    // Effect to handle active tab when a file is unchecked
    useEffect(() => {
        const activeFileIsChecked = checkedFiles.some(f => f.id === activeFileId);
        
        if (!activeFileIsChecked && checkedFiles.length > 0) {
            // If the active file was just unchecked, move to the first available checked file
            const newActiveId = checkedFiles[0].id;
            setActiveFileId(newActiveId);
            setActiveJsonFileId(newActiveId);
        } else if (checkedFiles.length === 0) {
            // If no files are checked, clear the preview
            setActiveFileId(null);
            setActiveJsonFileId(null);
            setIpynbPreviewContent(null);
        }
    }, [checkedFiles, activeFileId]); // Depends on the derived checkedFiles array

    const handleConvert = async () => {
        const filesToConvert = selectedFiles.filter(f => f.isChecked).map(f => f.file);
        if (filesToConvert.length === 0) {
            return;
        }

        const formData = new FormData();
        for (const file of filesToConvert) {
            formData.append('files', file);
        }

        setLoading(true);
        setError('');
        setJsonData(null);

        // Scroll to preview section
        const smoothScroll = (target, container) => {
            const targetPosition = target.offsetTop;
            const startPosition = container.scrollTop;
            const distance = targetPosition - startPosition;
            const duration = 750; // milliseconds
            let startTime = null;

            const animation = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = Math.min(timeElapsed / duration, 1);
                const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out
                container.scrollTop = startPosition + distance * ease(run);
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            };

            requestAnimationFrame(animation);
        };

        if (previewSectionRef.current && containerRef.current) {
            smoothScroll(previewSectionRef.current, containerRef.current);
        }

        try {
            const response = await axios.post('http://localhost:8000/convert/', formData);
            setJsonData(response.data);

            // After conversion, check if the active JSON tab is still valid
            const convertedFilenames = response.data.map(r => r.filename);
            const activeJsonFile = selectedFiles.find(f => f.id === activeJsonFileId);

            // If the active tab was for a file that is no longer in the results (was unchecked)
            // then set the active tab to the first of the new results.
            if (activeJsonFile && !convertedFilenames.includes(activeJsonFile.file.name)) {
                const firstFileInResult = selectedFiles.find(f => f.file.name === convertedFilenames[0]);
                setActiveJsonFileId(firstFileInResult ? firstFileInResult.id : null);
            }

        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                const errorDetail = err.response.data.detail;
                if (typeof errorDetail === 'object') {
                    setError(JSON.stringify(errorDetail));
                } else {
                    setError(errorDetail);
                }
            } else {
                setError('An error occurred during conversion. Please check the console and ensure the backend is running.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid" ref={containerRef}>
            <div className="scroll-page">
                <header className="header">
                    <h1>ipynb to JSON Converter</h1>
                    <p>Select one or more .ipynb files, see a preview of the first file, and convert them to simplified JSON.</p>
                </header>
                <FileUpload 
                    files={selectedFiles} // Pass the master list down
                    onConvert={handleConvert} 
                    onAddFiles={handleAddFiles}
                    onCheckboxChange={handleCheckboxChange}
                    loading={loading} 
                    onDeleteFile={handleDeleteRequest}
                />
                <ConfirmModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={confirmDelete}
                    message="Are you sure you want to delete this file? This action cannot be undone."
                />
                {error && <div className="error-message">{error}</div>}
            </div>
            <div className="scroll-page" ref={previewSectionRef}>
                <div className="preview-section">
                    <div className="preview-container">
                        <IpynbPreview 
                            files={checkedFiles} // Use the derived checkedFiles array
                            activeFileId={activeFileId}
                            onTabChange={handleTabChange}
                            fileContent={ipynbPreviewContent} 
                        />
                        <JsonDisplay 
                            files={checkedFiles} // Use the derived checkedFiles array
                            jsonData={jsonData}
                            activeFileId={activeJsonFileId}
                            onTabChange={handleJsonTabChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

import React, { useState, useEffect, useRef } from 'react';
import { Check, Copy } from 'lucide-react';

const JsonDisplay = ({ files, jsonData, activeFileId, onTabChange }) => {
    const [currentMenuOpen, setCurrentMenuOpen] = useState(false);
    const [allMenuOpen, setAllMenuOpen] = useState(false);
    const [justCopied, setJustCopied] = useState(null); // null, 'current', or 'all'
    const currentMenuRef = useRef(null);
    const allMenuRef = useRef(null);

    const activeFile = files.find(f => f.id === activeFileId);
    const activeFileData = activeFile && jsonData ? jsonData.find(d => d.filename === activeFile.file.name) : null;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (currentMenuRef.current && !currentMenuRef.current.contains(event.target)) {
                setCurrentMenuOpen(false);
            }
            if (allMenuRef.current && !allMenuRef.current.contains(event.target)) {
                setAllMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const downloadJson = (data, filename) => {
        if (!data) return;
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(data, null, 2)
        )}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = filename;
        link.click();
    };

    const handleCopy = (data, type) => {
        if (data) {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2));
            setJustCopied(type);
            setTimeout(() => setJustCopied(null), 2000); // Reset after 2 seconds
        }
    };

    return (
        <div className="display-section">
            <div className="pane-header">
                <h2>Conversion Result</h2>
                <div className="button-group">
                    <div className="dropdown" ref={currentMenuRef}>
                        <button onClick={() => setCurrentMenuOpen(!currentMenuOpen)} className="copy-button" disabled={!activeFileData}>
                            Export Current
                        </button>
                        <div className={`dropdown-menu ${currentMenuOpen ? 'open' : ''}`}>
                            <button className="dropdown-item" onClick={() => handleCopy(activeFileData, 'current')}>
                                {justCopied === 'current' ? (
                                    <><Check size={16} /> <span>Copied</span></>
                                ) : (
                                    <><Copy size={16} /> <span>Copy Current</span></>
                                )}
                            </button>
                            <button className="dropdown-item" onClick={() => { downloadJson(activeFileData, activeFile?.file.name.replace('.ipynb', '.json')); setCurrentMenuOpen(false); }}>
                                Download Current
                            </button>
                        </div>
                    </div>

                    <div className="dropdown" ref={allMenuRef}>
                        <button onClick={() => setAllMenuOpen(!allMenuOpen)} className="copy-button" disabled={!jsonData}>
                            Export All
                        </button>
                        <div className={`dropdown-menu ${allMenuOpen ? 'open' : ''}`}>
                            <button className="dropdown-item" onClick={() => handleCopy(jsonData, 'all')}>
                                {justCopied === 'all' ? (
                                    <><Check size={16} /> <span>Copied</span></>
                                ) : (
                                    <><Copy size={16} /> <span>Copy All</span></>
                                )}
                            </button>
                            <button className="dropdown-item" onClick={() => { downloadJson(jsonData, 'converted_notebooks.json'); setAllMenuOpen(false); }}>
                                Download All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tab-container">
                {files.map(file => (
                    <div 
                        key={file.id}
                        className={`tab-item ${file.id === activeFileId ? 'active' : ''}`}
                        onClick={() => onTabChange(file.id)}
                    >
                        {file.file.name}
                    </div>
                ))}
            </div>
            <div className="json-pre">
                {activeFileData ? (
                    <pre><code>{JSON.stringify(activeFileData, null, 2)}</code></pre>
                ) : (
                    <div className="empty-message">
                        <p>The converted JSON will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JsonDisplay;

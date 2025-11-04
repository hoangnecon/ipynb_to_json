import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const FileUpload = ({ files, onConvert, onAddFiles, onCheckboxChange, loading, onDeleteFile }) => {
    const fileInputRef = useRef(null);

    const handleBrowseChange = (event) => {
        onAddFiles(event.target.files);
        // Clear the input so the same file can be selected again if needed
        event.target.value = null;
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const hasCheckedFiles = files.some(f => f.isChecked);

    return (
        <div className="upload-section">
            <button className="browse-button" onClick={triggerFileSelect} disabled={loading}>
                Browse Files
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleBrowseChange}
                multiple
                accept=".ipynb"
                style={{ display: 'none' }}
            />

            {files.length > 0 && (
                <div className="file-list-container">
                    <ul className="file-checkbox-list">
                        {files.map(f => (
                            <li key={f.id}>
                                <div className="file-item">
                                    <label className="custom-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={f.isChecked}
                                            onChange={() => onCheckboxChange(f.id)}
                                            disabled={loading}
                                        />
                                        <span className="checkmark"></span>
                                    </label>
                                    <span className="file-name" title={f.file.name}>{f.file.name}</span>
                                    <button 
                                        className="delete-button" 
                                        onClick={() => onDeleteFile(f.id)}
                                        disabled={loading}
                                        title="Remove file"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button 
                className={`convert-button ${loading ? 'loading' : ''}`}
                onClick={onConvert} 
                disabled={!hasCheckedFiles || loading}
            >
                <span className="button-text">Convert Selected</span>
                {loading && (
                    <div className="spinner-overlay">
                        <div className="spinner"></div>
                    </div>
                )}
            </button>
        </div>
    );
};

export default FileUpload;

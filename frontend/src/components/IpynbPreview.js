import React from 'react';

const renderOutput = (output, index) => {
    switch (output.output_type) {
        case 'stream':
            return <pre key={index} className="output-stream">{Array.isArray(output.text) ? output.text.join('\n') : output.text}</pre>;
        case 'execute_result':
            if (output.data && output.data['text/plain']) {
                return <pre key={index} className="output-text">{Array.isArray(output.data['text/plain']) ? output.data['text/plain'].join('\n') : output.data['text/plain']}</pre>;
            }
            return null;
        case 'error':
            return (
                <pre key={index} className="output-error">
                    {`${output.ename}: ${output.evalue}\n`}
                    {output.traceback.join('\n')}
                </pre>
            );
        default:
            return null;
    }
};

const IpynbPreview = ({ files, activeFileId, onTabChange, fileContent }) => {
    let notebook = null;
    let errorMessage = null;

    if (fileContent) {
        try {
            notebook = JSON.parse(fileContent);
        } catch (e) {
            errorMessage = "Invalid .ipynb file format.";
        }
    }

    return (
        <div className="preview-pane">
            <div className="pane-header">
                <h2>Original .ipynb Preview</h2>
            </div>
            <div className="tab-container">
                {files && files.map(file => (
                    <div 
                        key={file.id}
                        className={`tab-item ${file.id === activeFileId ? 'active' : ''}`}
                        onClick={() => onTabChange(file.id)}
                    >
                        {file.file.name}
                    </div>
                ))}
            </div>
            <div className="notebook-content">
                {errorMessage ? (
                    <div className="empty-message"><p>{errorMessage}</p></div>
                ) : notebook ? (
                    notebook.cells && notebook.cells.map((cell, index) => (
                        <div key={cell.id || `cell-${index}`} className={`cell cell-${cell.cell_type}`}>
                            {cell.cell_type === 'markdown' && (
                                <div className="markdown-cell">
                                    <pre>{Array.isArray(cell.source) ? cell.source.join('\n') : cell.source}</pre>
                                </div>
                            )}
                            {cell.cell_type === 'code' && (
                                <div className="code-cell">
                                    <div className="input-area">
                                        <span className="execution-count">[{cell.execution_count || ' '}]</span>
                                        <pre><code>{Array.isArray(cell.source) ? cell.source.join('\n') : cell.source}</code></pre>
                                    </div>
                                    {cell.outputs && cell.outputs.length > 0 && (
                                        <div className="output-area">
                                            {cell.outputs.map((output, i) => renderOutput(output, i))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="empty-message">
                        <p>Select a file to see its preview here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IpynbPreview;

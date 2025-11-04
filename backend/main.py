import json
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def simplify_outputs(outputs: List[dict]) -> List[str]:
    """Extracts and simplifies the output from a cell, returning a list of strings."""
    simplified_output_lines = []
    for output in outputs:
        if output.get("output_type") == "stream":
            simplified_output_lines.extend([line.rstrip() for line in output.get("text", [])])
        elif output.get("output_type") == "execute_result":
            data = output.get("data", {})
            if "text/plain" in data:
                simplified_output_lines.extend([line.rstrip() for line in data["text/plain"]])
            elif "text/html" in data:
                # As a fallback, include html content lines, though it might be noisy
                simplified_output_lines.extend([line.rstrip() for line in data["text/html"]])
        elif output.get("output_type") == "error":
            simplified_output_lines.extend([line.rstrip() for line in output.get("traceback", [])])
    return simplified_output_lines

@app.post("/convert/")
async def convert_notebooks(files: List[UploadFile] = File(...)):
    """
    Accepts one or more .ipynb files, processes them, and
    returns a structured JSON output.
    """
    results = []
    for file in files:
        try:
            content = await file.read()
            notebook = json.loads(content)
            
            cleaned_cells = []
            for i, cell in enumerate(notebook.get("cells", [])):
                cell_outputs = cell.get("outputs", [])
                simplified_output = simplify_outputs(cell_outputs)
                
                cleaned_cell = {
                    "cell_id": cell.get("id", f"cell-{i+1}"),
                    "cell_type": cell.get("cell_type"),
                    "source": [line.rstrip() for line in cell.get("source", [])],
                    "outputs": simplified_output if simplified_output else None
                }
                cleaned_cells.append(cleaned_cell)
            
            results.append({
                "filename": file.filename,
                "cells": cleaned_cells
            })
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process {file.filename}: {str(e)}")
            
    return results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ipynb to json

This project converts Jupyter Notebook files (.ipynb) to JSON format. It consists of a Python backend and a React frontend.

## Prerequisites

*   [Node.js](https://nodejs.org/) (which includes npm)
*   [Python](https://www.python.org/) (and pip)

## Quick Start

1.  **Clone the repository**
    ```bash
    git clone https://github.com/hoangnecon/ipynb_to_json.git
    cd ipynb_to_json
    ```

2.  **Install dependencies**

    From the root directory, run:
    ```bash
    npm install
    ```
    This command will install the necessary `npm` packages for both the root-level controller and the `frontend`, and also the Python packages for the `backend` from `requirements.txt`.

3.  **Run the application**

    From the root directory, run:
    ```bash
    npm start
    ```
    This will start both the backend (on http://localhost:8000) and the frontend (on http://localhost:3000) concurrently.


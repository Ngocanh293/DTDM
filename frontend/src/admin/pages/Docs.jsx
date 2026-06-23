import React from 'react';

export default function Docs() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div className="">
              <h1 className="fs-3 mb-1">Documentation</h1>
              <p>This documentation will guide you through the setup and usage of the InApp Inventory Dashboard template.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div>
            <div>
              {/* Prerequisites */}
              <div className="mb-4">
                <div className="mb-2">
                  <h2 className="h5 mb-1">Prerequisites</h2>
                  <p>Before you begin, ensure you have the following installed:</p>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item ps-0">Node.js (v14 or higher)</li>
                  <li className="list-group-item ps-0">npm or yarn package manager</li>
                  <li className="list-group-item ps-0">Vite & React</li>
                </ul>
              </div>

              {/* Installation */}
              <div className="mb-4">
                <h2 className="h5 mb-2">Installation</h2>
                <ol className="list-group list-group-numbered list-group-flush">
                  <li className="list-group-item ps-0">Clone the repository or download the template</li>
                  <li className="list-group-item ps-0">Navigate to the project directory</li>
                  <li className="list-group-item ps-0">
                    Install dependencies:
                    <pre className="bg-light border rounded p-3 mt-2"><code>npm install</code></pre>
                  </li>
                </ol>
              </div>

              {/* Usage */}
              <div className="mb-6">
                <h2 className="h5 mb-2">Run the app</h2>
                <p>To start the development server:</p>
                <pre className="bg-light border rounded p-3"><code>npm run dev</code></pre>
              </div>

              {/* Next Steps */}
              <div className="mb-4">
                <h2 className="h5 mb-2">Next Steps</h2>
                <ol className="list-group list-group-numbered list-group-flush">
                  <li className="list-group-item ps-0">Review the main entry point in <code>src/main.jsx</code></li>
                  <li className="list-group-item ps-0">Customize components according to your needs</li>
                  <li className="list-group-item ps-0">
                    Build for production:
                    <pre className="bg-light border rounded p-3 mt-4"><code>npm run build</code></pre>
                  </li>
                </ol>
              </div>

              {/* Support */}
              <div className="mb-2">
                <h2 className="h5">Support</h2>
                <p>
                  For issues or questions, please refer to the documentation or create an issue in the repository. Also you can contact
                  us at <a href="#!" className="text-primary">CodesCandy</a>.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
